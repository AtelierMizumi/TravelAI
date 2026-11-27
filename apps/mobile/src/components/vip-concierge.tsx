import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Card,
  ErrorText,
  Field,
  money,
  ui,
  useAction,
} from "@/components/ui";
import { useMembership } from "@/context/membership";
import { api } from "@/services/api";
import {
  MONETIZATION_ACCENTS,
  TIER_PALETTES,
  getTierPalette,
} from "@/services/monetization-helpers";
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
  const palette = getTierPalette(membership.tier);
  const action = useAction();
  const [province, setProvince] = useState(defaultProvince);
  const [days, setDays] = useState(3);
  const [style, setStyle] = useState("LUXURY");
  const [plan, setPlan] = useState<VipItineraryResponse | null>(null);

  if (!membership.isPremium) {
    const freeHero = TIER_PALETTES.FREE;
    const vipPalette = TIER_PALETTES.VIP;
    return (
      <View style={[styles.outerCard, { borderColor: vipPalette.cardBorder, backgroundColor: "#ffffff" }]}>
        <View style={[styles.ribbonHeader, { backgroundColor: freeHero.heroBg }]}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.pillBadge,
                {
                  backgroundColor: vipPalette.ctaSecondaryBg,
                  borderColor: vipPalette.ctaSecondaryBorder,
                },
              ]}
            >
              <Text style={[styles.pillBadgeText, { color: vipPalette.ctaSecondaryText }]}>
                🔒 ĐẶC QUYỀN HỘI VIÊN
              </Text>
            </View>
            <Text style={[styles.tierHint, { color: freeHero.heroEyebrow }]}>
              Dành cho TravelAI Plus & Explorer VIP
            </Text>
          </View>
          <Text style={[styles.ribbonTitle, { color: freeHero.heroTitle }]}>
            ✨ AI VIP Concierge — Lập Lịch Trình Cá Nhân Hóa & Dự Toán Tiết Kiệm
          </Text>
          <Text style={[styles.ribbonSub, { color: freeHero.heroBody }]}>
            Tài khoản Cơ Bản (Free) hiện đang khóa tính năng này. Nâng cấp để mở khóa trọn bộ trợ lý thiết kế chuyến đi hạng sang:
          </Text>
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.perkBox}>
            <Text style={styles.perkItem}>
              ✦ Tự động thiết kế lịch trình Sáng / Chiều / Tối từ địa danh & dịch vụ thật
            </Text>
            <Text style={styles.perkItem}>
              ✦ Tính toán trực tiếp ngân sách ưu đãi Hội viên (-5% đến -10%) cho chuyến đi
            </Text>
            <Text style={styles.perkItem}>
              ✦ Nghe trợ lý giọng nói đọc thuyết minh toàn bộ lịch trình VIP bằng Tiếng Việt
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/subscriptions")}
            style={[styles.ctaButton, { backgroundColor: vipPalette.ctaBg }]}
          >
            <Text style={[styles.ctaButtonText, { color: vipPalette.ctaText }]}>
              👑 Nâng cấp Hội viên VIP để mở khóa ngay →
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.outerCard,
        { backgroundColor: palette.cardBg, borderColor: palette.cardBorder },
      ]}
    >
      <View style={[styles.ribbonHeader, { backgroundColor: palette.heroBg }]}>
        <View style={styles.headerRow}>
          <View
            style={[
              styles.pillBadge,
              {
                backgroundColor: palette.ctaSecondaryBg,
                borderColor: palette.ctaSecondaryBorder,
              },
            ]}
          >
            <Text style={[styles.pillBadgeText, { color: palette.ctaSecondaryText }]}>
              {membership.badge} · ĐÃ MỞ KHÓA CONCIERGE
            </Text>
          </View>
          <View style={styles.savingsPill}>
            <Text style={styles.savingsPillText}>Ưu đãi -{membership.discountPercent}%</Text>
          </View>
        </View>
        <Text style={[styles.ribbonTitle, { color: palette.heroTitle }]}>
          ✨ AI VIP Concierge — Thiết Kế Hành Trình Riêng Cho Bạn
        </Text>
        <Text style={[styles.ribbonSub, { color: palette.heroBody }]}>
          Chọn điểm đến, số ngày và phong cách trải nghiệm để hệ thống lập kế hoạch kèm báo giá đặc quyền {membership.planName}.
        </Text>
      </View>

      <View style={styles.bodyContent}>
        <Text style={[styles.sectionLabel, { color: palette.headingText }]}>
          Chọn nhanh điểm đến nổi bật
        </Text>
        <View style={styles.chipRow}>
          {POPULAR_PROVINCES.map((p) => {
            const active = province === p;
            return (
              <Pressable
                key={p}
                accessibilityRole="button"
                onPress={() => setProvince(p)}
                style={[
                  styles.chip,
                  active && { backgroundColor: palette.ctaBg, borderColor: palette.ctaBg },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && { color: palette.ctaText, fontWeight: "800" },
                  ]}
                >
                  {p}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label="Tỉnh / Thành phố muốn đi"
          value={province}
          onChangeText={setProvince}
          placeholder="Nhập tên tỉnh/thành"
        />

        <Text style={[styles.sectionLabel, { color: palette.headingText }]}>
          Số ngày hành trình
        </Text>
        <View style={styles.chipRow}>
          {[2, 3, 4, 5].map((d) => {
            const active = days === d;
            return (
              <Pressable
                key={d}
                accessibilityRole="button"
                onPress={() => setDays(d)}
                style={[
                  styles.chip,
                  active && { backgroundColor: palette.ctaBg, borderColor: palette.ctaBg },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && { color: palette.ctaText, fontWeight: "800" },
                  ]}
                >
                  {d} ngày {d - 1} đêm
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: palette.headingText }]}>
          Phong cách đặc quyền
        </Text>
        <View style={styles.chipRow}>
          {STYLES.map((s) => {
            const active = style === s.id;
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                onPress={() => setStyle(s.id)}
                style={[
                  styles.chip,
                  active && { backgroundColor: palette.ctaBg, borderColor: palette.ctaBg },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active && { color: palette.ctaText, fontWeight: "800" },
                  ]}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
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
          style={[
            styles.ctaButton,
            { backgroundColor: palette.ctaBg },
            action.busy && { opacity: 0.6 },
          ]}
        >
          <Text style={[styles.ctaButtonText, { color: palette.ctaText }]}>
            {action.busy
              ? "⏳ Đang thiết kế lịch trình đặc quyền..."
              : `✨ Tạo Lịch Trình ${membership.badge} (${days}N${days - 1}Đ)`}
          </Text>
        </Pressable>

        {plan && (
          <View style={styles.resultWrap}>
            <View
              style={[
                styles.budgetBox,
                { backgroundColor: palette.heroBg, borderColor: palette.heroBorder },
              ]}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={[styles.budgetTitle, { color: palette.heroEyebrow }]}>
                  Dự toán đặc quyền tại {plan.province} ({plan.styleLabel})
                </Text>
                {plan.estimatedOriginalVnd > 0 ? (
                  <>
                    <Text style={[styles.strikeOnDark, { color: palette.heroBody }]}>
                      Giá niêm yết: {money(plan.estimatedOriginalVnd)}
                    </Text>
                    <Text style={[styles.memberTotal, { color: palette.heroTitle }]}>
                      Giá {plan.badge} (-{plan.discountPercent}%):{" "}
                      {money(plan.estimatedMemberVnd)}
                    </Text>
                    <Text style={styles.savedHighlight}>
                      🎉 Tiết kiệm ngay {money(plan.estimatedSavedVnd)} nhờ thẻ Hội viên!
                    </Text>
                  </>
                ) : (
                  <Text style={styles.savedHighlight}>
                    Mọi Tour & Khách sạn bạn đặt thêm đều được giảm tự động {plan.discountPercent}%!
                  </Text>
                )}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void Speech.stop().then(() =>
                    Speech.speak(plan.conciergeSummary, { language: "vi-VN" }),
                  );
                }}
                style={[styles.voiceBtn, { backgroundColor: palette.heroCtaBg }]}
              >
                <Text style={[styles.voiceBtnText, { color: palette.heroCtaText }]}>
                  🔊 Nghe thuyết minh VIP
                </Text>
              </Pressable>
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
                    <Text style={[styles.recVipPrice, { color: palette.priceText }]}>
                      {money(t.memberPrice)} (-{plan.discountPercent}%) →
                    </Text>
                  </Pressable>
                ))}
                {plan.recommendedHotels.map((h) => (
                  <Pressable
                    key={`H-${h.id}`}
                    onPress={() =>
                      router.push({
                        pathname: "/booking/hotels/[id]",
                        params: { id: String(h.id) },
                      })
                    }
                    style={styles.recRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recName}>🏨 {h.name}</Text>
                      <Text style={styles.recStrike}>{money(h.originalPrice)}</Text>
                    </View>
                    <Text style={[styles.recVipPrice, { color: palette.priceText }]}>
                      {money(h.memberPrice)} (-{plan.discountPercent}%) →
                    </Text>
                  </Pressable>
                ))}
              </Card>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerCard: {
    borderRadius: 24,
    borderWidth: 2,
    overflow: "hidden",
  },
  ribbonHeader: {
    padding: 20,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pillBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillBadgeText: {
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  savingsPill: {
    backgroundColor: MONETIZATION_ACCENTS.savingsBg,
    borderColor: MONETIZATION_ACCENTS.savingsBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  savingsPillText: {
    color: MONETIZATION_ACCENTS.savingsText,
    fontWeight: "800",
    fontSize: 12,
  },
  tierHint: { fontSize: 12, fontWeight: "800" },
  ribbonTitle: { fontSize: 20, fontWeight: "800", lineHeight: 27 },
  ribbonSub: { fontSize: 14, lineHeight: 21 },
  bodyContent: {
    padding: 20,
    gap: 12,
  },
  perkBox: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  perkItem: { color: "#1e293b", fontSize: 14, lineHeight: 22, fontWeight: "600" },
  sectionLabel: { fontSize: 14, fontWeight: "800" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
  },
  chipText: { color: "#1e293b", fontSize: 13, fontWeight: "600" },
  ctaButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: { fontWeight: "900", fontSize: 15 },
  resultWrap: { gap: 12, marginTop: 6 },
  budgetBox: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    gap: 12,
  },
  budgetTitle: { fontSize: 15, fontWeight: "800" },
  strikeOnDark: {
    fontSize: 13,
    textDecorationLine: "line-through",
    opacity: 0.9,
  },
  memberTotal: { fontSize: 20, fontWeight: "900" },
  savedHighlight: {
    color: MONETIZATION_ACCENTS.savingsOnDark,
    fontSize: 14,
    fontWeight: "800",
  },
  voiceBtn: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  voiceBtnText: { fontSize: 14, fontWeight: "900" },
  recRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  recName: { color: "#103c5b", fontWeight: "700", fontSize: 14 },
  recStrike: {
    color: "#64748b",
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  recVipPrice: { fontWeight: "900", fontSize: 14 },
});
