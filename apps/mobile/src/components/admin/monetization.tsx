import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  money,
  serviceTime,
  ui,
  useAction,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import { calculateCtrPercent } from "@/services/monetization-helpers";
import type { AdminMonetizationOverview } from "@/services/types";

export function AdminMonetization() {
  const overview = useResource<AdminMonetizationOverview>("/admin/monetization/overview");
  const action = useAction();
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [planPrices, setPlanPrices] = useState<Record<string, string>>({});
  const [pkgPrices, setPkgPrices] = useState<Record<string, string>>({});

  const data = overview.data;

  async function decide(campaignId: string, decision: "APPROVE" | "REJECT" | "PAUSE" | "RESUME") {
    await api(`/admin/monetization/ads/${encodeURIComponent(campaignId)}/decision`, {
      method: "POST",
      body: {
        action: decision,
        reason: rejectNote[campaignId] || "",
      },
    });
    overview.reload();
  }

  return (
    <View style={{ gap: 16 }}>
      <ErrorText message={overview.error || action.error} />
      {data && (
        <>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Hội viên đang hoạt động</Text>
              <Text style={styles.kpiValue}>{data.activeSubscribers}</Text>
              <Text style={styles.kpiSub}>Doanh thu hội viên: {money(data.subscriptionRevenue)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Chiến dịch chờ duyệt</Text>
              <Text style={styles.kpiValue}>{data.pendingCampaigns}</Text>
              <Text style={styles.kpiSub}>Đang hiển thị: {data.activeCampaigns}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Tổng doanh thu gói (SIMULATED)</Text>
              <Text style={styles.kpiValue}>{money(data.totalMonetizationRevenue)}</Text>
              <Text style={styles.kpiSub}>Quảng cáo ròng: {money(data.adRevenue)}</Text>
            </View>
          </View>

          <Card>
            <Text style={ui.heading}>Duyệt & Điều phối Chiến dịch Quảng cáo</Text>
            {!data.campaigns.length && (
              <Text style={ui.text}>Chưa có chiến dịch quảng cáo nào trong hệ thống.</Text>
            )}
            {data.campaigns.map((camp) => (
              <Card key={camp.id}>
                <View style={styles.rowBetween}>
                  <Text style={ui.heading}>
                    {camp.targetName} ({camp.targetKind}) · {camp.packageName}
                  </Text>
                  <Text style={styles.badge}>{camp.status}</Text>
                </View>
                <Text style={ui.text}>
                  Người mua: {camp.ownerName || `#${camp.ownerId}`}{" "}
                  {camp.ownerEmail ? `(${camp.ownerEmail})` : ""}
                </Text>
                <Text style={ui.text}>Thông điệp: {camp.headline}</Text>
                <Text style={ui.text}>
                   Đã thu SIMULATED: {money(camp.paidAmount)} · {camp.durationDays} ngày ·{" "}
                  {camp.impressions} lượt xem · {camp.clicks} click (
                  {calculateCtrPercent(camp.impressions, camp.clicks)}%)
                </Text>
                {camp.endsAt && (
                  <Text style={ui.text}>Hiệu lực đến: {serviceTime(camp.endsAt)}</Text>
                )}
                {camp.status === "PENDING" && (
                  <>
                    <Field
                      label="Lý do từ chối / ghi chú kiểm duyệt (tùy chọn)"
                      value={rejectNote[camp.id] || ""}
                      onChangeText={(val) =>
                        setRejectNote((prev) => ({ ...prev, [camp.id]: val }))
                      }
                    />
                    <View style={ui.row}>
                      <Action
                        title="Duyệt hiển thị"
                        disabled={action.busy}
                        onPress={() => action.run(() => decide(camp.id, "APPROVE"))}
                      />
                      <Action
                        secondary
                        title="Từ chối & Hoàn tiền 100%"
                        disabled={action.busy}
                        onPress={() => action.run(() => decide(camp.id, "REJECT"))}
                      />
                    </View>
                  </>
                )}
                {camp.status === "ACTIVE" && (
                  <Action
                    secondary
                    title="Tạm dừng chiến dịch"
                    disabled={action.busy}
                    onPress={() => action.run(() => decide(camp.id, "PAUSE"))}
                  />
                )}
                {camp.status === "PAUSED" && (
                  <Action
                    title="Bật hiển thị lại"
                    disabled={action.busy}
                    onPress={() => action.run(() => decide(camp.id, "RESUME"))}
                  />
                )}
              </Card>
            ))}
          </Card>

          <Card>
            <Text style={ui.heading}>Cấu hình Bảng giá Gói Thành Viên (SIMULATED VND)</Text>
            {data.subscriptionPlans.map((plan) => (
              <Card key={plan.code}>
                <Text style={ui.heading}>
                  {plan.name} ({plan.code}) · {plan.active ? "Đang mở bán" : "Đang tắt"}
                </Text>
                <Text style={ui.text}>
                  Giá hiện tại: {money(plan.priceVnd)} / {plan.durationDays} ngày · Giảm{" "}
                  {plan.discountPercent}% đặt chỗ
                </Text>
                <Field
                  label="Cập nhật giá mới (VND)"
                  keyboardType="numeric"
                  value={planPrices[plan.code] ?? String(plan.priceVnd)}
                  onChangeText={(v) =>
                    setPlanPrices((prev) => ({ ...prev, [plan.code]: v }))
                  }
                />
                <View style={ui.row}>
                  <Action
                    title="Lưu giá mới"
                    disabled={action.busy}
                    onPress={() =>
                      action.run(async () => {
                        const parsed = Number(planPrices[plan.code] ?? plan.priceVnd);
                        await api(`/admin/monetization/plans/${plan.code}`, {
                          method: "PUT",
                          body: { priceVnd: parsed },
                        });
                        overview.reload();
                      })
                    }
                  />
                  <Action
                    secondary
                    title={plan.active ? "Tạm ngưng bán" : "Mở bán lại"}
                    disabled={action.busy}
                    onPress={() =>
                      action.run(async () => {
                        await api(`/admin/monetization/plans/${plan.code}`, {
                          method: "PUT",
                          body: { active: !plan.active },
                        });
                        overview.reload();
                      })
                    }
                  />
                </View>
              </Card>
            ))}
          </Card>

          <Card>
            <Text style={ui.heading}>Cấu hình Bảng giá Gói Quảng Cáo (SIMULATED VND)</Text>
            {data.adPackages.map((pkg) => (
              <Card key={pkg.code}>
                <Text style={ui.heading}>
                  {pkg.name} ({pkg.code}) · {pkg.active ? "Đang mở bán" : "Đang tắt"}
                </Text>
                <Text style={ui.text}>
                  Giá hiện tại: {money(pkg.priceVnd)} / {pkg.durationDays} ngày · Vị trí:{" "}
                  {pkg.placement}
                </Text>
                <Field
                  label="Cập nhật giá mới (VND)"
                  keyboardType="numeric"
                  value={pkgPrices[pkg.code] ?? String(pkg.priceVnd)}
                  onChangeText={(v) =>
                    setPkgPrices((prev) => ({ ...prev, [pkg.code]: v }))
                  }
                />
                <View style={ui.row}>
                  <Action
                    title="Lưu giá gói QC"
                    disabled={action.busy}
                    onPress={() =>
                      action.run(async () => {
                        const parsed = Number(pkgPrices[pkg.code] ?? pkg.priceVnd);
                        await api(`/admin/monetization/packages/${pkg.code}`, {
                          method: "PUT",
                          body: { priceVnd: parsed },
                        });
                        overview.reload();
                      })
                    }
                  />
                  <Action
                    secondary
                    title={pkg.active ? "Tạm ngưng gói" : "Mở bán lại"}
                    disabled={action.busy}
                    onPress={() =>
                      action.run(async () => {
                        await api(`/admin/monetization/packages/${pkg.code}`, {
                          method: "PUT",
                          body: { active: !pkg.active },
                        });
                        overview.reload();
                      })
                    }
                  />
                </View>
              </Card>
            ))}
          </Card>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kpiCard: {
    flexGrow: 1,
    flexBasis: 200,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e8edf5",
    padding: 16,
    gap: 6,
  },
  kpiLabel: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  kpiValue: { color: "#0f172a", fontSize: 24, fontWeight: "800" },
  kpiSub: { color: "#087fba", fontSize: 12, fontWeight: "700" },
  rowBetween: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3457df",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
