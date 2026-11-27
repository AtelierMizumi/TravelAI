import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { PinTabs } from "@/components/pin-ui";
import {
  Action,
  Card,
  ErrorText,
  Field,
  money,
  Nav,
  Screen,
  serviceTime,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { api, operationKey } from "@/services/api";
import { operationAttempt } from "@/services/attempt";
import { calculateCtrPercent } from "@/services/monetization-helpers";
import type {
  Bank,
  CatalogItem,
  MonetizationCatalog,
  MonetizationSummary,
} from "@/services/types";

const PLACEMENT_LABELS: Record<string, string> = {
  EXPLORE_DESTINATION: "Đầu trang Khám phá & Gợi ý cùng tỉnh sau quét AI",
  HOME_FEED: "Đề xuất nổi bật Trang chủ & Bảng tin cộng đồng",
  ALL: "Toàn bộ vị trí VIP (Trang chủ, Khám phá, Bảng tin, Gợi ý AI)",
};

export default function SubscriptionsScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState("plans");
  const catalog = useResource<MonetizationCatalog>("/monetization/catalog");
  const summary = useResource<MonetizationSummary>(user ? "/monetization/me" : null);
  const bank = useResource<Bank>(user ? "/booking/bank" : null);
  const tours = useResource<CatalogItem[]>("/tours");
  const hotels = useResource<CatalogItem[]>("/hotels");

  const [selectedPlan, setSelectedPlan] = useState("PLUS");
  const [selectedPackage, setSelectedPackage] = useState("SPOTLIGHT");
  const [targetKind, setTargetKind] = useState<"TOUR" | "HOTEL">("TOUR");
  const [targetId, setTargetId] = useState<number | null>(null);
  const [headline, setHeadline] = useState("");
  const [cardId, setCardId] = useState("");
  const [cvv, setCvv] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState("");

  const subAttempt = useRef<{ payload: string; key: string } | null>(null);
  const adAttempt = useRef<{ payload: string; key: string } | null>(null);
  const action = useAction();

  const current = summary.data?.currentSubscription;
  const quota = summary.data?.aiQuota;
  const targetOptions = (targetKind === "TOUR" ? tours.data : hotels.data) || [];
  const chosenPlan = catalog.data?.subscriptionPlans.find((p) => p.code === selectedPlan);
  const chosenPkg = catalog.data?.adPackages.find((p) => p.code === selectedPackage);

  async function handleBuySubscription() {
    if (!chosenPlan || !confirmed || !cardId || !cvv) return;
    setNotice("");
    subAttempt.current = operationAttempt(
      subAttempt.current,
      { planCode: chosenPlan.code, cardId, confirmed: true },
      operationKey,
    );
    await api("/monetization/subscriptions/purchase", {
      method: "POST",
      key: subAttempt.current.key,
      body: {
        planCode: chosenPlan.code,
        cardId,
        testCvv: cvv.trim(),
        confirmed: true,
      },
    });
    subAttempt.current = null;
    setCvv("");
    setConfirmed(false);
    setNotice(`Đã kích hoạt thành công gói ${chosenPlan.name} (SIMULATED).`);
    summary.reload();
    bank.reload();
  }

  async function handleBuyAd() {
    if (!chosenPkg || !targetId || !confirmed || !cardId || !cvv) return;
    setNotice("");
    adAttempt.current = operationAttempt(
      adAttempt.current,
      { packageCode: chosenPkg.code, targetKind, targetId, headline: headline.trim(), cardId },
      operationKey,
    );
    await api("/monetization/ads/purchase", {
      method: "POST",
      key: adAttempt.current.key,
      body: {
        packageCode: chosenPkg.code,
        targetKind,
        targetId,
        headline: headline.trim(),
        cardId,
        testCvv: cvv.trim(),
        confirmed: true,
      },
    });
    adAttempt.current = null;
    setCvv("");
    setHeadline("");
    setConfirmed(false);
    setNotice("Đã gửi chiến dịch quảng cáo (trạng thái PENDING chờ Admin duyệt hiển thị).");
    summary.reload();
    bank.reload();
  }

  return (
    <Screen title="Gói thành viên & Quảng cáo SIMULATED" protected>
      <Card>
        <View style={styles.bannerTop}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={ui.heading}>
              Hạng hiện tại: {current?.planName || "Cơ Bản (Free)"}{" "}
              {current?.badge ? `(${current.badge})` : ""}
            </Text>
            <Text style={ui.text}>
              {current?.status === "ACTIVE" && current.expiresAt
                ? `Có hiệu lực đến ${serviceTime(current.expiresAt)} · Giảm tự động ${current.discountPercent}% khi đặt Tour/Khách sạn.`
                : "Đang sử dụng gói miễn phí. Nâng cấp để giảm 5%–10% chi phí đặt chỗ và mở không giới hạn AI."}
            </Text>
            {quota && (
              <Text style={styles.quotaText}>
                Hạn mức AI hôm nay:{" "}
                {quota.unlimited
                  ? "Không giới hạn (Hội viên Plus/VIP)"
                  : `Đã dùng ${quota.usedToday}/${quota.dailyLimit} lượt miễn phí (còn ${quota.remaining} lượt)`}
              </Text>
            )}
          </View>
          {bank.data && (
            <View style={styles.balanceBox}>
              <Text style={styles.balanceLabel}>Số dư SIMULATED</Text>
              <Text style={styles.balanceValue}>{money(bank.data.balance)}</Text>
            </View>
          )}
        </View>
        {current?.status === "ACTIVE" && current.id && (
          <Action
            secondary
            title="Hủy gói hiện tại"
            disabled={action.busy}
            onPress={() =>
              action.run(async () => {
                await api(`/monetization/subscriptions/${encodeURIComponent(current.id!)}/cancel`, {
                  method: "POST",
                });
                setNotice("Đã hủy gói thành viên hiện tại.");
                summary.reload();
              })
            }
          />
        )}
      </Card>

      <PinTabs
        value={tab}
        onChange={(next) => {
          setTab(next);
          setNotice("");
          setConfirmed(false);
        }}
        tabs={[
          { id: "plans", label: "Gói thành viên (B2C)", icon: "sparkles-outline" },
          { id: "ads", label: "Gói quảng cáo (Sponsored)", icon: "megaphone-outline" },
        ]}
      />

      <ErrorText message={catalog.error || summary.error || bank.error || action.error} />
      {!!notice && (
        <Card>
          <Text style={styles.successText}>✓ {notice}</Text>
        </Card>
      )}

      {tab === "plans" && (
        <>
          <View style={[ui.row, { alignItems: "stretch" }]}>
            <View style={styles.planCol}>
              <Card>
                <Text style={styles.tierTag}>MẶC ĐỊNH</Text>
                <Text style={ui.heading}>Cơ Bản (Free)</Text>
                <Text style={styles.bigPrice}>0 ₫</Text>
                <Text style={ui.text}>
                  • {catalog.data?.freeDailyAiLimit ?? 10} lượt AI miễn phí / ngày{"\n"}• Đặt chỗ Tour & Khách sạn tiêu chuẩn{"\n"}• Tham gia cộng đồng du lịch
                </Text>
              </Card>
            </View>
            {catalog.data?.subscriptionPlans.map((plan) => {
              const isSelected = selectedPlan === plan.code;
              return (
                <View key={plan.code} style={styles.planCol}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedPlan(plan.code);
                      setConfirmed(false);
                    }}
                    style={[styles.selectableCard, isSelected && styles.selectableActive]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.tierTag}>{plan.badge}</Text>
                      <Text style={styles.discountPill}>Giảm {plan.discountPercent}% đặt chỗ</Text>
                    </View>
                    <Text style={ui.heading}>{plan.name}</Text>
                    <Text style={styles.bigPrice}>
                      {money(plan.priceVnd)} / {plan.durationDays} ngày
                    </Text>
                    <Text style={ui.text}>{plan.description}</Text>
                    <Text style={styles.selectHint}>
                      {isSelected ? "● Đang chọn gói này" : "Chạm để chọn gói này"}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {chosenPlan && (
            <Card>
              <Text style={ui.heading}>
                Thanh toán nâng cấp · {chosenPlan.name} ({money(chosenPlan.priceVnd)})
              </Text>
              <Text style={ui.text}>
                Mọi giao dịch đều là SIMULATED VND trừ trên thẻ mô phỏng đã liên kết. Nếu đang còn hạn cùng gói, hệ thống tự cộng dồn thêm {chosenPlan.durationDays} ngày.
              </Text>
              <Text style={ui.label}>Chọn thẻ ngân hàng SIMULATED</Text>
              {bank.data?.cards.map((c) => (
                <Action
                  key={c.cardId}
                  title={`${c.bankName} · ${c.cardId} · ${c.status}`}
                  disabled={c.status !== "ACTIVE"}
                  secondary={cardId !== c.cardId}
                  onPress={() => {
                    setCardId(c.cardId);
                    setConfirmed(false);
                  }}
                />
              ))}
              {!bank.data?.cards.length && (
                <Nav href="/profile">Liên kết thẻ ngân hàng SIMULATED trong Hồ sơ →</Nav>
              )}
              <Field
                label="Mã kiểm tra 3 chữ số SIMULATED"
                value={cvv}
                onChangeText={setCvv}
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={ui.row}>
                <Switch
                  value={confirmed}
                  onValueChange={setConfirmed}
                  accessibilityLabel="Xác nhận đăng ký gói thành viên SIMULATED"
                />
                <Text style={[ui.text, { flex: 1 }]}>
                  Tôi xác nhận thanh toán SIMULATED {money(chosenPlan.priceVnd)} cho gói{" "}
                  {chosenPlan.name}.
                </Text>
              </View>
              <Action
                title={`Kích hoạt ${chosenPlan.name} (SIMULATED)`}
                disabled={action.busy || !confirmed || !cardId || !cvv.trim()}
                onPress={() => action.run(handleBuySubscription)}
              />
            </Card>
          )}
        </>
      )}

      {tab === "ads" && (
        <>
          <Card>
            <Text style={ui.heading}>Tạo chiến dịch quảng bá Tour / Khách sạn</Text>
            <Text style={ui.text}>
              Sau khi thanh toán SIMULATED, chiến dịch ở trạng thái PENDING để Admin duyệt nội dung. Thời hạn gói chỉ bắt đầu tính từ thời điểm được duyệt hiển thị; nếu bị từ chối sẽ được hoàn 100% SIMULATED VND.
            </Text>

            <Text style={ui.label}>1. Chọn gói vị trí hiển thị</Text>
            <View style={{ gap: 10 }}>
              {catalog.data?.adPackages.map((pkg) => {
                const isSelected = selectedPackage === pkg.code;
                return (
                  <Pressable
                    key={pkg.code}
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedPackage(pkg.code);
                      setConfirmed(false);
                    }}
                    style={[styles.selectableCard, isSelected && styles.selectableActive]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <Text style={ui.heading}>{pkg.name}</Text>
                      <Text style={styles.bigPrice}>
                        {money(pkg.priceVnd)} / {pkg.durationDays} ngày
                      </Text>
                    </View>
                    <Text style={styles.quotaText}>
                      Vị trí: {PLACEMENT_LABELS[pkg.placement] || pkg.placement}
                    </Text>
                    <Text style={ui.text}>{pkg.description}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={ui.label}>2. Chọn loại dịch vụ cần đẩy nổi bật</Text>
            <PinTabs
              value={targetKind}
              onChange={(val) => {
                setTargetKind(val as "TOUR" | "HOTEL");
                setTargetId(null);
              }}
              tabs={[
                { id: "TOUR", label: "Tour du lịch", icon: "compass-outline" },
                { id: "HOTEL", label: "Khách sạn", icon: "bed-outline" },
              ]}
            />
            <View style={styles.chips}>
              {targetOptions.map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  onPress={() => setTargetId(item.id)}
                  style={[styles.chip, targetId === item.id && styles.chipSelected]}
                >
                  <Text style={styles.chipText}>
                    #{item.id} · {item.name} ({item.province || item.location})
                  </Text>
                </Pressable>
              ))}
              {targetOptions.length === 0 && (
                <Text style={ui.text}>Chưa có dịch vụ đang hoạt động trong danh mục này.</Text>
              )}
            </View>

            <Field
              label="3. Thông điệp quảng bá ngắn (tối đa 140 ký tự)"
              value={headline}
              onChangeText={setHeadline}
              placeholder="Ví dụ: Ưu đãi hè giảm sâu - Khởi hành hàng ngày"
            />

            <Text style={ui.label}>4. Chọn thẻ ngân hàng SIMULATED</Text>
            {bank.data?.cards.map((c) => (
              <Action
                key={c.cardId}
                title={`${c.bankName} · ${c.cardId} · ${c.status}`}
                disabled={c.status !== "ACTIVE"}
                secondary={cardId !== c.cardId}
                onPress={() => {
                  setCardId(c.cardId);
                  setConfirmed(false);
                }}
              />
            ))}
            {!bank.data?.cards.length && (
              <Nav href="/profile">Liên kết thẻ ngân hàng SIMULATED trong Hồ sơ →</Nav>
            )}
            <Field
              label="Mã kiểm tra 3 chữ số SIMULATED"
              value={cvv}
              onChangeText={setCvv}
              secureTextEntry
              autoCapitalize="none"
            />
            {chosenPkg && (
              <View style={ui.row}>
                <Switch
                  value={confirmed}
                  onValueChange={setConfirmed}
                  accessibilityLabel="Xác nhận mua gói quảng cáo SIMULATED"
                />
                <Text style={[ui.text, { flex: 1 }]}>
                  Tôi xác nhận thanh toán SIMULATED {money(chosenPkg.priceVnd)} cho chiến dịch{" "}
                  {chosenPkg.name} và chờ Admin duyệt hiển thị.
                </Text>
              </View>
            )}
            <Action
              title={
                chosenPkg
                  ? `Gửi chiến dịch · ${money(chosenPkg.priceVnd)} (SIMULATED)`
                  : "Gửi chiến dịch quảng cáo"
              }
              disabled={action.busy || !chosenPkg || !targetId || !confirmed || !cardId || !cvv.trim()}
              onPress={() => action.run(handleBuyAd)}
            />
          </Card>

          <Card>
            <Text style={ui.heading}>Chiến dịch quảng cáo của bạn</Text>
            {!summary.data?.campaigns.length && (
              <Text style={ui.text}>Bạn chưa tạo chiến dịch quảng cáo nào.</Text>
            )}
            {summary.data?.campaigns.map((c) => (
              <Card key={c.id}>
                <View style={styles.cardHeaderRow}>
                  <Text style={ui.heading}>
                    {c.targetName} · {c.packageName}
                  </Text>
                  <Text style={styles.statusPill}>{c.status}</Text>
                </View>
                <Text style={ui.text}>Thông điệp: {c.headline}</Text>
                <Text style={ui.text}>
                  Chi phí SIMULATED: {money(c.paidAmount)} · Thời lượng: {c.durationDays} ngày
                  {c.endsAt ? ` · Hết hạn: ${serviceTime(c.endsAt)}` : ""}
                </Text>
                <View style={styles.metricsStrip}>
                  <View style={styles.metricItem}>
                    <Ionicons name="eye-outline" size={16} color="#087fba" />
                    <Text style={styles.metricText}>{c.impressions} lượt xem</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="hand-left-outline" size={16} color="#087fba" />
                    <Text style={styles.metricText}>{c.clicks} lượt nhấn</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Ionicons name="trending-up-outline" size={16} color="#087fba" />
                    <Text style={styles.metricText}>
                      CTR: {calculateCtrPercent(c.impressions, c.clicks)}%
                    </Text>
                  </View>
                </View>
                {!!c.adminNote && <Text style={ui.text}>Ghi chú quản trị: {c.adminNote}</Text>}
              </Card>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bannerTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  balanceBox: {
    backgroundColor: "#e2f3fc",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  balanceLabel: { fontSize: 12, color: "#075782", fontWeight: "600" },
  balanceValue: { fontSize: 18, color: "#087fba", fontWeight: "800" },
  quotaText: { fontSize: 13, color: "#087fba", fontWeight: "700" },
  successText: { color: "#047857", fontWeight: "700", fontSize: 14 },
  planCol: { flexBasis: 260, flexGrow: 1, minWidth: 0 },
  selectableCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#dce6f4",
    gap: 8,
  },
  selectableActive: {
    borderColor: "#087fba",
    backgroundColor: "#f4faff",
  },
  cardHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  tierTag: {
    fontSize: 12,
    fontWeight: "800",
    color: "#087fba",
    letterSpacing: 0.4,
  },
  discountPill: {
    fontSize: 12,
    fontWeight: "700",
    color: "#047857",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  bigPrice: { fontSize: 20, fontWeight: "800", color: "#103c5b" },
  selectHint: { fontSize: 12, fontWeight: "700", color: "#087fba", marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#dce6f4",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#e2f3fc", borderColor: "#087fba" },
  chipText: { fontSize: 13, color: "#1e293b", fontWeight: "600" },
  statusPill: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1e40af",
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metricsStrip: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingTop: 4 },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metricText: { fontSize: 13, fontWeight: "700", color: "#334155" },
});
