import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { PinTabs } from "@/components/pin-ui";
import { VipConcierge } from "@/components/vip-concierge";
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
import { useMembership } from "@/context/membership";
import { useResource } from "@/hooks/use-resource";
import { api, operationKey } from "@/services/api";
import { operationAttempt } from "@/services/attempt";
import {
  MONETIZATION_ACCENTS,
  TIER_PALETTES,
  calculateCtrPercent,
  getTierPalette,
} from "@/services/monetization-helpers";
import type {
  Bank,
  CatalogItem,
  MonetizationCatalog,
  MonetizationSummary,
  VipDealsResponse,
} from "@/services/types";

const PLACEMENT_LABELS: Record<string, string> = {
  EXPLORE_DESTINATION: "Đầu trang Khám phá & Gợi ý cùng tỉnh sau quét AI",
  HOME_FEED: "Đề xuất nổi bật Trang chủ & Bảng tin cộng đồng",
  ALL: "Toàn bộ vị trí VIP (Trang chủ, Khám phá, Bảng tin, Gợi ý AI)",
};

export default function SubscriptionsScreen() {
  const { user } = useAuth();
  const membership = useMembership();
  const activePalette = getTierPalette(membership.tier);
  const [tab, setTab] = useState("plans");
  const catalog = useResource<MonetizationCatalog>("/monetization/catalog");
  const summary = useResource<MonetizationSummary>(user ? "/monetization/me" : null);
  const vipDeals = useResource<VipDealsResponse>(
    user && membership.isPremium ? "/monetization/vip/deals" : null,
    0,
    true,
    membership.tier,
  );
  const bank = useResource<Bank>(user ? "/booking/bank" : null);
  const tours = useResource<CatalogItem[]>("/tours");
  const hotels = useResource<CatalogItem[]>("/hotels");

  const [selectedPlan, setSelectedPlan] = useState("VIP");
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
  const chosenPlanPalette = getTierPalette(chosenPlan?.code);
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
    setNotice(
      `Đã kích hoạt thành công gói ${chosenPlan.name} (SIMULATED). Toàn bộ giao diện & bảng giá đã đồng bộ sang chế độ Đặc quyền!`,
    );
    summary.reload();
    membership.reloadMembership();
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
      {membership.isPremium ? (
        <View
          style={[
            styles.heroStatusCard,
            {
              backgroundColor: activePalette.heroBg,
              borderColor: activePalette.heroBorder,
            },
          ]}
        >
          <View style={styles.bannerTop}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.heroEyebrow, { color: activePalette.heroEyebrow }]}>
                  ĐẶC QUYỀN ĐANG HOẠT ĐỘNG
                </Text>
                <View
                  style={[
                    styles.tierBadgePill,
                    {
                      backgroundColor: activePalette.ctaSecondaryBg,
                      borderColor: activePalette.ctaSecondaryBorder,
                    },
                  ]}
                >
                  <Text style={[styles.tierBadgeText, { color: activePalette.ctaSecondaryText }]}>
                    {current?.badge || membership.badge} · Giảm {membership.discountPercent}%
                  </Text>
                </View>
              </View>
              <Text style={[styles.heroTitle, { color: activePalette.heroTitle }]}>
                {current?.planName || membership.planName}
              </Text>
              <Text style={[styles.heroBody, { color: activePalette.heroBody }]}>
                {current?.status === "ACTIVE" && current.expiresAt
                  ? `Có hiệu lực đến ${serviceTime(current.expiresAt)} · Tự động giảm ${current.discountPercent}% trên mọi đơn đặt Tour & Khách sạn.`
                  : `Đang áp dụng chiết khấu hội viên ${membership.discountPercent}% và mở khóa toàn bộ đặc quyền AI.`}
              </Text>
              {quota && (
                <Text style={[styles.heroQuota, { color: activePalette.heroEyebrow }]}>
                  ✦ Hạn mức AI hôm nay: Không giới hạn lượt nhận diện & AI VIP Concierge
                </Text>
              )}
            </View>
            {bank.data && (
              <View
                style={[
                  styles.heroBalanceBox,
                  {
                    backgroundColor: activePalette.heroSubBg,
                    borderColor: activePalette.heroBorder,
                  },
                ]}
              >
                <Text style={[styles.heroBalanceLabel, { color: activePalette.heroStatLabel }]}>
                  Số dư SIMULATED
                </Text>
                <Text style={[styles.heroBalanceValue, { color: activePalette.heroStatValue }]}>
                  {money(bank.data.balance)}
                </Text>
              </View>
            )}
          </View>
          {current?.status === "ACTIVE" && current.id && (
            <Pressable
              accessibilityRole="button"
              disabled={action.busy}
              onPress={() =>
                action.run(async () => {
                  await api(`/monetization/subscriptions/${encodeURIComponent(current.id!)}/cancel`, {
                    method: "POST",
                  });
                  setNotice("Đã hủy gói thành viên hiện tại.");
                  summary.reload();
                  membership.reloadMembership();
                })
              }
              style={[
                styles.heroCancelBtn,
                {
                  backgroundColor: activePalette.heroSubBg,
                  borderColor: activePalette.heroBody,
                },
                action.busy && { opacity: 0.5 },
              ]}
            >
              <Text style={[styles.heroCancelText, { color: activePalette.heroTitle }]}>
                Hủy gói hiện tại
              </Text>
            </Pressable>
          )}
        </View>
      ) : (
        <Card>
          <View style={styles.bannerTop}>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.cardHeaderRow}>
                <Text style={ui.heading}>Hạng hiện tại: Cơ Bản (Free)</Text>
                <View
                  style={[
                    styles.tierBadgePill,
                    {
                      backgroundColor: TIER_PALETTES.FREE.badgeBg,
                      borderColor: TIER_PALETTES.FREE.badgeBorder,
                    },
                  ]}
                >
                  <Text style={[styles.tierBadgeText, { color: TIER_PALETTES.FREE.badgeText }]}>
                    GÓI MẶC ĐỊNH
                  </Text>
                </View>
              </View>
              <Text style={ui.text}>
                Nâng cấp lên TravelAI Plus (-5%) hoặc Explorer VIP (-10%) để sở hữu giao diện Hội viên riêng biệt, trừ thẳng tiền khi đặt Tour/Khách sạn và mở khóa AI VIP Concierge.
              </Text>
              {quota && (
                <Text style={styles.quotaText}>
                  Hạn mức AI hôm nay: Đã dùng {quota.usedToday}/{quota.dailyLimit} lượt miễn phí (còn{" "}
                  {quota.remaining} lượt)
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
        </Card>
      )}

      <PinTabs
        value={tab}
        onChange={(next) => {
          setTab(next);
          setNotice("");
          setConfirmed(false);
        }}
        tabs={[
          { id: "plans", label: "Gói thành viên (B2C)", icon: "sparkles-outline" },
          { id: "lounge", label: "👑 Đặc quyền VIP Lounge", icon: "diamond-outline" },
          { id: "ads", label: "Gói quảng cáo (Sponsored)", icon: "megaphone-outline" },
        ]}
      />

      <ErrorText message={catalog.error || summary.error || bank.error || action.error} />
      {!!notice && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ {notice}</Text>
        </View>
      )}

      {tab === "plans" && (
        <>
          <View style={[ui.row, { alignItems: "stretch" }]}>
            {/* FREE TIER CARD */}
            <View style={styles.planCol}>
              <View
                style={[
                  styles.planCardBase,
                  {
                    backgroundColor: TIER_PALETTES.FREE.cardBg,
                    borderColor: TIER_PALETTES.FREE.cardBorder,
                  },
                ]}
              >
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.tierBadgePill,
                      {
                        backgroundColor: TIER_PALETTES.FREE.badgeBg,
                        borderColor: TIER_PALETTES.FREE.badgeBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.tierBadgeText, { color: TIER_PALETTES.FREE.badgeText }]}>
                      MẶC ĐỊNH
                    </Text>
                  </View>
                  {!membership.isPremium && (
                    <Text style={[styles.currentPlanLabel, { color: TIER_PALETTES.FREE.mutedText }]}>
                      Đang dùng
                    </Text>
                  )}
                </View>
                <Text style={[styles.planTitle, { color: TIER_PALETTES.FREE.headingText }]}>
                  Cơ Bản (Free)
                </Text>
                <Text style={[styles.bigPrice, { color: TIER_PALETTES.FREE.priceText }]}>0 ₫</Text>
                <Text style={[styles.planDesc, { color: TIER_PALETTES.FREE.bodyText }]}>
                  • {catalog.data?.freeDailyAiLimit ?? 10} lượt AI miễn phí / ngày{"\n"}• Đặt chỗ Tour & Khách sạn giá niêm yết{"\n"}• Tham gia cộng đồng du lịch{"\n"}• Không bao gồm AI VIP Concierge
                </Text>
              </View>
            </View>

            {/* PLUS & VIP TIER CARDS */}
            {catalog.data?.subscriptionPlans.map((plan) => {
              const isSelected = selectedPlan === plan.code;
              const p = getTierPalette(plan.code);
              const isCurrentTier = membership.tier === plan.code;
              return (
                <View key={plan.code} style={styles.planCol}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedPlan(plan.code);
                      setConfirmed(false);
                    }}
                    style={[
                      styles.planCardBase,
                      {
                        backgroundColor: p.cardBg,
                        borderColor: isSelected ? p.cardBorderSelected : p.cardBorder,
                        borderWidth: isSelected ? 2.5 : 1.5,
                      },
                    ]}
                  >
                    <View style={styles.cardHeaderRow}>
                      <View
                        style={[
                          styles.tierBadgePill,
                          { backgroundColor: p.badgeBg, borderColor: p.badgeBorder },
                        ]}
                      >
                        <Text style={[styles.tierBadgeText, { color: p.badgeText }]}>
                          {plan.badge}
                          {plan.code === "VIP" ? " · ĐẶC QUYỀN CAO NHẤT" : ""}
                        </Text>
                      </View>
                      <View style={styles.savingsPill}>
                        <Text style={styles.savingsPillText}>
                          Giảm {plan.discountPercent}% đặt chỗ
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.planTitle, { color: p.headingText }]}>{plan.name}</Text>
                    <Text style={[styles.bigPrice, { color: p.priceText }]}>
                      {money(plan.priceVnd)} / {plan.durationDays} ngày
                    </Text>
                    <Text style={[styles.planDesc, { color: p.bodyText }]}>{plan.description}</Text>

                    <View
                      style={[
                        styles.planSelectFooter,
                        isSelected
                          ? { backgroundColor: p.ctaBg, borderColor: p.ctaBg }
                          : {
                              backgroundColor: p.ctaSecondaryBg,
                              borderColor: p.ctaSecondaryBorder,
                            },
                      ]}
                    >
                      <Text
                        style={[
                          styles.planSelectFooterText,
                          { color: isSelected ? p.ctaText : p.ctaSecondaryText },
                        ]}
                      >
                        {isCurrentTier
                          ? `✓ Đang sở hữu · ${isSelected ? "Gia hạn thêm" : "Chạm để gia hạn"}`
                          : isSelected
                            ? "✓ Đang chọn gói này"
                            : "Chạm để chọn gói này"}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>

          {chosenPlan && (
            <View
              style={[
                styles.checkoutCard,
                {
                  backgroundColor: "#ffffff",
                  borderColor: chosenPlanPalette.cardBorderSelected,
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <Text style={ui.heading}>
                  Thanh toán nâng cấp · {chosenPlan.name}
                </Text>
                <View
                  style={[
                    styles.tierBadgePill,
                    {
                      backgroundColor: chosenPlanPalette.badgeBg,
                      borderColor: chosenPlanPalette.badgeBorder,
                    },
                  ]}
                >
                  <Text style={[styles.tierBadgeText, { color: chosenPlanPalette.badgeText }]}>
                    {chosenPlan.badge} · {money(chosenPlan.priceVnd)}
                  </Text>
                </View>
              </View>
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
              <Pressable
                accessibilityRole="button"
                disabled={action.busy || !confirmed || !cardId || !cvv.trim()}
                onPress={() => action.run(handleBuySubscription)}
                style={[
                  styles.primaryTierButton,
                  { backgroundColor: chosenPlanPalette.ctaBg },
                  (action.busy || !confirmed || !cardId || !cvv.trim()) && { opacity: 0.45 },
                ]}
              >
                <Text style={[styles.primaryTierButtonText, { color: chosenPlanPalette.ctaText }]}>
                  {`Kích hoạt ${chosenPlan.name} · ${money(chosenPlan.priceVnd)}`}
                </Text>
              </Pressable>
            </View>
          )}
        </>
      )}

      {tab === "lounge" && (
        <>
          <VipConcierge />
          {!membership.isPremium ? (
            <Card>
              <Text style={ui.heading}>
                🔒 Kho Deal Hội Viên Dành Riêng Cho Plus & Explorer VIP
              </Text>
              <Text style={ui.text}>
                Nâng cấp ở tab Gói thành viên để mở khóa ngay bảng giá ưu đãi riêng (-5% đến -10%) trên mọi Tour & Khách sạn cùng đặc quyền miễn phí đổi lịch lần đầu!
              </Text>
              <Action
                title="Chuyển sang chọn gói nâng cấp →"
                onPress={() => setTab("plans")}
              />
            </Card>
          ) : (
            <Card>
              <View style={styles.cardHeaderRow}>
                <Text style={ui.heading}>
                  👑 Bảng Giá Đặc Quyền Của Riêng Bạn
                </Text>
                <View
                  style={[
                    styles.tierBadgePill,
                    {
                      backgroundColor: activePalette.badgeBg,
                      borderColor: activePalette.badgeBorder,
                    },
                  ]}
                >
                  <Text style={[styles.tierBadgeText, { color: activePalette.badgeText }]}>
                    {membership.badge} · Giảm {membership.discountPercent}%
                  </Text>
                </View>
              </View>
              <Text style={ui.text}>
                Mọi mức giá bên dưới đã áp dụng chiết khấu cố định {membership.discountPercent}% dành riêng cho thẻ {membership.planName}.
              </Text>
              {!vipDeals.data?.deals.length && (
                <Text style={ui.text}>Chưa có Tour hoặc Khách sạn đang mở bán để tính ưu đãi.</Text>
              )}
              {vipDeals.data?.deals.map((deal) => (
                <View
                  key={`${deal.kind}-${deal.id}`}
                  style={[
                    styles.dealItemCard,
                    {
                      backgroundColor: activePalette.cardBg,
                      borderColor: activePalette.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.planTitle, { color: activePalette.headingText }]}>
                      {deal.kind === "TOUR" ? "🧭" : "🏨"} {deal.name}
                    </Text>
                    <View style={styles.savingsPill}>
                      <Text style={styles.savingsPillText}>
                        Tiết kiệm {money(deal.savedAmount)}
                      </Text>
                    </View>
                  </View>
                  {!!deal.location && (
                    <Text style={[styles.planDesc, { color: activePalette.bodyText }]}>
                      {deal.location}
                    </Text>
                  )}
                  <Text style={styles.strikeText}>
                    Giá niêm yết: {money(deal.originalPrice)}
                  </Text>
                  <Text style={[styles.bigPrice, { color: activePalette.priceText }]}>
                    Giá {membership.badge}: {money(deal.memberPrice)}
                  </Text>
                  <Action
                    secondary
                    title="Đặt ngay với giá Hội viên →"
                    onPress={() =>
                      router.push({
                        pathname:
                          deal.kind === "TOUR"
                            ? "/booking/tours/[id]"
                            : "/booking/hotels/[id]",
                        params: { id: String(deal.id) },
                      })
                    }
                  />
                </View>
              ))}
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
  heroStatusCard: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 22,
    gap: 14,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "900",
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  heroQuota: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  heroBalanceBox: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  heroBalanceLabel: { fontSize: 12, fontWeight: "700" },
  heroBalanceValue: { fontSize: 18, fontWeight: "900" },
  heroCancelBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  heroCancelText: { fontSize: 14, fontWeight: "800" },
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
  quotaText: { fontSize: 13, color: "#075985", fontWeight: "700" },
  successBanner: {
    backgroundColor: MONETIZATION_ACCENTS.savingsBg,
    borderColor: MONETIZATION_ACCENTS.savingsBorder,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
  },
  successText: { color: MONETIZATION_ACCENTS.savingsText, fontWeight: "800", fontSize: 15 },
  planCol: { flexBasis: 270, flexGrow: 1, minWidth: 0 },
  planCardBase: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1.5,
    gap: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  planTitle: { fontSize: 20, fontWeight: "800" },
  planDesc: { fontSize: 15, lineHeight: 23 },
  currentPlanLabel: { fontSize: 12, fontWeight: "700" },
  tierBadgePill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tierBadgeText: { fontSize: 12, fontWeight: "900", letterSpacing: 0.3 },
  savingsPill: {
    backgroundColor: MONETIZATION_ACCENTS.savingsBg,
    borderColor: MONETIZATION_ACCENTS.savingsBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  savingsPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: MONETIZATION_ACCENTS.savingsText,
  },
  planSelectFooter: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  planSelectFooterText: { fontSize: 13, fontWeight: "800" },
  checkoutCard: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 22,
    gap: 12,
  },
  primaryTierButton: {
    minHeight: 50,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryTierButtonText: { fontSize: 15, fontWeight: "900" },
  dealItemCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    gap: 8,
  },
  strikeText: {
    color: "#64748b",
    textDecorationLine: "line-through",
    fontSize: 13,
    fontWeight: "600",
  },
  selectableCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#dce6f4",
    gap: 8,
  },
  selectableActive: {
    borderColor: "#0284c7",
    backgroundColor: "#f0f9ff",
  },
  cardHeaderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  bigPrice: { fontSize: 20, fontWeight: "900", color: "#103c5b" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#e0f2fe", borderColor: "#0284c7" },
  chipText: { fontSize: 13, color: "#1e293b", fontWeight: "700" },
  statusPill: {
    fontSize: 12,
    fontWeight: "800",
    color: MONETIZATION_ACCENTS.sponsoredText,
    backgroundColor: MONETIZATION_ACCENTS.sponsoredBg,
    borderColor: MONETIZATION_ACCENTS.sponsoredBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  metricsStrip: { flexDirection: "row", flexWrap: "wrap", gap: 16, paddingTop: 4 },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metricText: { fontSize: 13, fontWeight: "700", color: "#334155" },
});
