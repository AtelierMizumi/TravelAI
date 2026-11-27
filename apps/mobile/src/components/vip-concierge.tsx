import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  money,
  ui,
  useAction,
} from "@/components/ui";
import { useMembership } from "@/context/membership";
import { api } from "@/services/api";
import type { VipItineraryResponse } from "@/services/types";

const POPULAR_PROVINCES = [
  "Đà Nẵng",
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Thừa Thiên Huế",
  "Quảng Ninh",
  "Lâm Đồng",
];

const STYLES = [
  { id: "LUXURY", label: "💎 Nghỉ dưỡng hạng sang" },
  { id: "CULTURE", label: "🏛️ Văn hóa & Di sản" },
  { id: "OPTIMAL", label: "⚡ Tối ưu thông minh" },
];

export function VipConcierge({ defaultProvince = "Đà Nẵng" }: { defaultProvince?: string }) {
  const membership = useMembership();
  const action = useAction();
  const [province, setProvince] = useState(defaultProvince);
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState("LUXURY");
  const [plan, setPlan] = useState<VipItineraryResponse | null>(null);

  if (!membership.isPremium) {
    return (
      <View style={styles.lockedCard}>
        <View style={styles.lockedHeader}>
          <Text style={styles.lockedBadge}>🔒 ĐẶC QUYỀN PREMIUM</Text>
          <Text style={styles.lockedTierHint}>Chỉ mở cho Plus & Explorer VIP</Text>
        </View>
        <Text style={styles.lockedTitle}>
          ✨ AI VIP Concierge — Lập Lịch Trình Cá Nhân Hóa & Dự Toán Tiết Kiệm
        </Text>
        <Text style={styles.lockedDesc}>
          Tài khoản Cơ Bản (Free) hiện đang bị khóa tính năng này. Khi nâng cấp lên gói Plus hoặc Explorer VIP, bạn sẽ mở khóa:
        </Text>
        <View style={styles.lockedPerks}>
          <Text style={styles.lockedPerkItem}>
            • Tự động thiết kế lịch trình Sáng / Chiều / Tối từ địa danh & dịch vụ thật
          </Text>
          <Text style={styles.lockedPerkItem}>
            • Tính toán trực tiếp ngân sách ưu đãi VIP (-5% đến -10%) cho chuyến đi
          </Text>
          <Text style={styles.lockedPerkItem}>
            • Nghe trợ lý giọng nói đọc thuyết minh toàn bộ lịch trình VIP
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/subscriptions")}
          style={styles.unlockButton}
        >
          <Text style={styles.unlockButtonText}>
            👑 Nâng cấp Hội viên VIP để mở khóa ngay →
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.vipContainer, membership.isVip && styles.vipContainerDiamond]}>
      <View style={styles.vipHeaderRow}>
        <Text style={styles.vipCrownTag}>
          {membership.badge} · ĐÃ MỞ KHÓA ĐẶC QUYỀN CONCIERGE
        </Text>
        <Text style={styles.vipDiscountTag}>Ưu đãi -{membership.discountPercent}%</Text>
      </View>
      <Text style={styles.vipTitle}>
        ✨ AI VIP Concierge — Thiết Kế Hành Trình Riêng Cho Bạn
      </Text>
      <Text style={styles.vipSub}>
        Chọn điểm đến, số ngày và phong cách trải nghiệm để hệ thống lập kế hoạch kèm báo giá đặc quyền {membership.planName}.
      </Text>

      <View style={styles.chipRow}>
        {POPULAR_PROVINCES.map((p) => (
          <Pressable
            key={p}
            accessibilityRole="button"
            onPress={() => setProvince(p)}
            style={[styles.chip, province === p && styles.chipActive]}
          >
            <Text style={[styles.chipText, province === p && styles.chipTextActive]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Field
        label="Tỉnh / Thành phố muốn đi"
        value={province}
        onChangeText={setProvince}
        placeholder="Nhập tên tỉnh/thành"
      />

      <Text style={styles.labelLight}>Số ngày hành trình</Text>
      <View style={styles.chipRow}>
        {[2, 3, 4, 5].map((d) => (
          <Pressable
            key={d}
            accessibilityRole="button"
            onPress={() => setDays(d)}
            style={[styles.chip, days === d && styles.chipActive]}
          >
            <Text style={[styles.chipText, days === d && styles.chipTextActive]}>
              {d} ngày {d - 1} đêm
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.labelLight}>Phong cách đặc quyền</Text>
      <View style={styles.chipRow}>
        {STYLES.map((s) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            onPress={() => setStyle(s.id)}
            style={[styles.chip, style === s.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, style === s.id && styles.chipTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ErrorText message={action.error} />
      <Pressable
        accessibilityRole="button"
        disabled={action.busy || !province.trim()}
        onPress={() =>
          action.run(async () => {
            const res = await api<VipItineraryResponse>("/monetization/vip/itinerary", {
              method: "POST",
              body: { province: province.trim(), days, style },
            });
            setPlan(res);
          })
        }
        style={[styles.unlockButton, action.busy && { opacity: 0.6 }]}
      >
        <Text style={styles.unlockButtonText}>
          {action.busy
            ? "⏳ Đang thiết kế lịch trình đặc quyền..."
            : `✨ Tạo Lịch Trình ${membership.badge} (${days}N${days - 1}Đ)`}
        </Text>
      </Pressable>

      {plan && (
        <View style={styles.resultWrap}>
          <View style={styles.budgetBox}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.budgetTitle}>
                Dự toán đặc quyền tại {plan.province} ({plan.styleLabel})
              </Text>
              {plan.estimatedOriginalVnd > 0 ? (
                <>
                  <Text style={styles.strikeLight}>
                    Giá thông thường: {money(plan.estimatedOriginalVnd)}
                  </Text>
                  <Text style={styles.memberTotal}>
                    Giá {plan.badge} (-{plan.discountPercent}%):{" "}
                    {money(plan.estimatedMemberVnd)}
                  </Text>
                  <Text style={styles.savedHighlight}>
                    🎉 Bạn tiết kiệm ngay {money(plan.estimatedSavedVnd)} nhờ thẻ Hội viên!
                  </Text>
                </>
              ) : (
                <Text style={styles.savedHighlight}>
                  Mọi Tour & Khách sạn bạn đặt thêm đều được giảm tự động {plan.discountPercent}%!
                </Text>
              )}
            </View>
            <Action
              secondary
              title="🔊 Nghe thuyết minh VIP"
              onPress={() => {
                void Speech.stop().then(() =>
                  Speech.speak(plan.conciergeSummary, { language: "vi-VN" }),
                );
              }}
            />
          </View>

          {plan.days.map((d) => (
            <Card key={d.day}>
              <Text style={ui.heading}>{d.title}</Text>
              <Text style={ui.text}>🌅 Sáng: {d.morning}</Text>
              <Text style={ui.text}>☀️ Chiều: {d.afternoon}</Text>
              <Text style={ui.text}>🌙 Tối: {d.evening}</Text>
            </Card>
          ))}

          {(plan.recommendedTours.length > 0 || plan.recommendedHotels.length > 0) && (
            <Card>
              <Text style={ui.heading}>Dịch vụ khớp lịch trình với Giá Đặc Quyền</Text>
              {plan.recommendedTours.map((t) => (
                <Pressable
                  key={`T-${t.id}`}
                  onPress={() =>
                    router.push({ pathname: "/booking/tours/[id]", params: { id: String(t.id) } })
                  }
                  style={styles.recRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recName}>🧭 {t.name}</Text>
                    <Text style={styles.recStrike}>{money(t.originalPrice)}</Text>
                  </View>
                  <Text style={styles.recVipPrice}>
                    {money(t.memberPrice)} (-{plan.discountPercent}%) →
                  </Text>
                </Pressable>
              ))}
              {plan.recommendedHotels.map((h) => (
                <Pressable
                  key={`H-${h.id}`}
                  onPress={() =>
                    router.push({ pathname: "/booking/hotels/[id]", params: { id: String(h.id) } })
                  }
                  style={styles.recRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recName}>🏨 {h.name}</Text>
                    <Text style={styles.recStrike}>{money(h.originalPrice)}</Text>
                  </View>
                  <Text style={styles.recVipPrice}>
                    {money(h.memberPrice)} (-{plan.discountPercent}%) →
                  </Text>
                </Pressable>
              ))}
            </Card>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  lockedCard: {
    backgroundColor: "#1e293b",
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    padding: 20,
    gap: 10,
  },
  lockedHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  lockedBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    fontWeight: "900",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lockedTierHint: { color: "#fcd34d", fontSize: 12, fontWeight: "700" },
  lockedTitle: { color: "#fff", fontSize: 19, fontWeight: "800" },
  lockedDesc: { color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  lockedPerks: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  lockedPerkItem: { color: "#e2e8f0", fontSize: 13, lineHeight: 20 },
  unlockButton: {
    marginTop: 4,
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockButtonText: { color: "#1e1b4b", fontWeight: "900", fontSize: 15 },
  vipContainer: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#f59e0b",
    padding: 20,
    gap: 12,
  },
  vipContainerDiamond: {
    backgroundColor: "#1e1b4b",
    borderColor: "#fbbf24",
  },
  vipHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  vipCrownTag: {
    backgroundColor: "#fef3c7",
    color: "#78350f",
    fontWeight: "900",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  vipDiscountTag: {
    backgroundColor: "#065f46",
    color: "#a7f3d0",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  vipTitle: { color: "#fff", fontSize: 21, fontWeight: "800" },
  vipSub: { color: "#cbd5e1", fontSize: 14, lineHeight: 21 },
  labelLight: { color: "#fde68a", fontSize: 13, fontWeight: "700" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#334155",
    borderWidth: 1,
    borderColor: "#475569",
  },
  chipActive: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  chipText: { color: "#e2e8f0", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#78350f", fontWeight: "800" },
  resultWrap: { gap: 12, marginTop: 6 },
  budgetBox: {
    backgroundColor: "#111827",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f59e0b",
    padding: 16,
    gap: 10,
  },
  budgetTitle: { color: "#fde68a", fontSize: 15, fontWeight: "800" },
  strikeLight: {
    color: "#94a3b8",
    fontSize: 13,
    textDecorationLine: "line-through",
  },
  memberTotal: { color: "#fff", fontSize: 20, fontWeight: "900" },
  savedHighlight: { color: "#34d399", fontSize: 13, fontWeight: "800" },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  recName: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
  recStrike: {
    color: "#94a3b8",
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  recVipPrice: { color: "#047857", fontWeight: "800", fontSize: 14 },
});
