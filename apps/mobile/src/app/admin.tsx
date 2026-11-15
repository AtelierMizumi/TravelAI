import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Card, ErrorText, Screen, ui } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { AdminUsers } from "@/components/admin/users";
import { AdminCatalog } from "@/components/admin/catalog";
import { AdminPosts } from "@/components/admin/moderation";
import { AdminSettings } from "@/components/admin/settings";
import { AdminPolicies, AdminCalendar } from "@/components/admin/policies";
import { AdminBank } from "@/components/admin/bank";
import { AdminBookings } from "@/components/admin/bookings";
import { adminAccess } from "@/context/authGuard";
import { bookingSplit } from "@/services/admin-stats";
type Icon = ComponentProps<typeof Ionicons>["name"];
const sections: { key: string; label: string; icon: Icon }[] = [
  { key: "stats", label: "Tổng quan", icon: "grid-outline" },
  { key: "users", label: "Người dùng", icon: "people-outline" },
  { key: "tours", label: "Tour", icon: "compass-outline" },
  { key: "hotels", label: "Khách sạn", icon: "bed-outline" },
  { key: "places", label: "Điểm đến", icon: "location-outline" },
  { key: "posts", label: "Duyệt bài", icon: "document-text-outline" },
  { key: "bookings", label: "Đặt chỗ", icon: "calendar-outline" },
  { key: "policies", label: "Chính sách và tồn chỗ", icon: "shield-checkmark-outline" },
  { key: "calendar", label: "Lịch lễ", icon: "today-outline" },
  { key: "bank", label: "Ngân hàng SIMULATED", icon: "card-outline" },
  { key: "settings", label: "Hệ thống", icon: "settings-outline" },
];
const metrics: { key: string; title: string; icon: Icon; description: string }[] = [
  { key: "users", title: "Tổng người dùng", icon: "people-outline", description: "Tài khoản trong hệ thống" },
  { key: "totalBookings", title: "Đặt chỗ đã xác nhận", icon: "calendar-outline", description: "Tour và khách sạn" },
  { key: "places", title: "Điểm đến", icon: "location-outline", description: "Địa điểm trong danh mục" },
  { key: "posts", title: "Bài viết", icon: "document-text-outline", description: "Nội dung cộng đồng" },
];
const TOUR = "#5064e9";
const HOTEL = "#10b9a0";
function Stats() {
  const resource = useResource<Record<string, number>>("/admin/stats");
  const split = bookingSplit(resource.data);
  const circumference = 2 * Math.PI * 54;
  return (
    <View style={styles.overview}>
      <View>
        <Text style={styles.heading}>Tổng quan hệ thống</Text>
        <Text style={styles.subtitle}>Số liệu lấy trực tiếp từ dữ liệu đang có.</Text>
      </View>
      <ErrorText message={resource.error} />
      <Pressable accessibilityRole="button" onPress={resource.reload} disabled={resource.loading} style={styles.refreshButton}>
        <Ionicons name="refresh-outline" size={16} color="#3457df" />
        <Text style={styles.refreshText}>{resource.loading ? "Đang tải..." : "Làm mới số liệu"}</Text>
      </Pressable>
      {resource.loading && !resource.data && <ActivityIndicator accessibilityLabel="Đang tải thống kê" />}
      {resource.data && (
        <View style={styles.metrics}>
          {metrics.map((metric) => (
            <View key={metric.key} style={styles.metric}>
              <View style={styles.metricTop}>
                <Text style={styles.metricLabel}>{metric.title}</Text>
                <View style={styles.metricIcon}><Ionicons name={metric.icon} size={22} color="#4f46e5" /></View>
              </View>
              <Text style={styles.metricValue}>{Number.isFinite(resource.data?.[metric.key]) ? resource.data![metric.key].toLocaleString("vi-VN") : "—"}</Text>
              <Text style={styles.metricDescription}>{metric.description}</Text>
            </View>
          ))}
        </View>
      )}
      {resource.data && (
        <Card>
          <Text style={styles.sectionTitle}>Đặt chỗ theo loại dịch vụ</Text>
          {split ? (
            <View style={styles.chartColumns} accessibilityLabel={`Tour ${split.tourPercent}%, khách sạn ${split.hotelPercent}%`}>
              <View style={styles.chartBars}>
                {[
                  { label: "Tour", count: resource.data.tourBookings, bar: split.tourBar, color: TOUR },
                  { label: "Khách sạn", count: resource.data.hotelBookings, bar: split.hotelBar, color: HOTEL },
                ].map((row) => (
                  <View key={row.label} style={styles.chartRow}>
                    <View style={styles.chartLegend}>
                      <Text style={styles.metricLabel}>{row.label}</Text>
                      <Text style={styles.chartValue}>{row.count.toLocaleString("vi-VN")}</Text>
                    </View>
                    <View style={styles.chartTrack}><View style={{ height: "100%", width: `${row.bar}%`, backgroundColor: row.color, borderRadius: 8 }} /></View>
                  </View>
                ))}
              </View>
              <View style={styles.donutRow}>
                <View style={styles.donut}>
                  <Svg width={148} height={148} viewBox="0 0 148 148">
                    <Circle cx={74} cy={74} r={54} stroke={HOTEL} strokeWidth={16} fill="none" />
                    <Circle cx={74} cy={74} r={54} stroke={TOUR} strokeWidth={16} fill="none" strokeDasharray={`${(circumference * split.tourPercent) / 100} ${circumference}`} transform="rotate(-90 74 74)" />
                  </Svg>
                  <View style={styles.donutCenter}>
                    <Text style={styles.donutTotal}>{split.total.toLocaleString("vi-VN")}</Text>
                    <Text style={styles.metricDescription}>đặt chỗ</Text>
                  </View>
                </View>
                <View style={{ gap: 12 }}>
                  <Text style={[styles.legendText, { color: TOUR }]}>● Tour · {split.tourPercent}%</Text>
                  <Text style={[styles.legendText, { color: HOTEL }]}>● Khách sạn · {split.hotelPercent}%</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.metricDescription}>Chưa có đặt chỗ đã xác nhận để vẽ biểu đồ.</Text>
          )}
          <Text style={styles.metricDescription}>Chỉ tính đặt chỗ đã xác nhận, không phải doanh thu.</Text>
        </Card>
      )}
    </View>
  );
}
export default function Admin() {
  const { user, loading } = useAuth();
  const { width } = useWindowDimensions();
  const compact = width < 850;
  const [section, setSection] = useState<string>("stats");
  const access = adminAccess({ user, loading });
  const selected = sections.find((item) => item.key === section);
  return (
    <Screen title="Quản trị TravelAI" protected>
      {access === "loading" ? (
        <Text style={ui.text}>Đang tải…</Text>
      ) : access === "allowed" ? (
        <View style={[styles.layout, compact && styles.layoutCompact]}>
          <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
            <Pressable accessibilityRole="button" onPress={() => router.replace("/")} style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={16} color="#3457df" />
              <Text style={styles.refreshText}>Về trang người dùng</Text>
            </Pressable>
            <Text style={styles.menuTitle}>MENU QUẢN TRỊ</Text>
            <View style={compact ? styles.menuCompact : styles.menu}>
              {sections.map((item) => {
                const active = section === item.key;
                return (
                  <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setSection(item.key)} style={[styles.menuItem, compact && styles.menuItemCompact, active && styles.menuItemActive]}>
                    <View style={[styles.menuIcon, active && styles.menuIconActive]}><Ionicons name={item.icon} size={19} color={active ? "#fff" : "#64748b"} /></View>
                    <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View style={[styles.main, compact && styles.mainCompact]}>
            <View style={styles.topbar}><Text style={styles.topTitle}>{selected?.label}</Text></View>
            <View style={styles.body}>
              {section === "stats" && <Stats />}
              {section === "users" && <AdminUsers />}
              {(section === "tours" || section === "hotels" || section === "places") && <AdminCatalog key={section} kind={section} />}
              {section === "posts" && <AdminPosts />}
              {section === "bookings" && <AdminBookings />}
              {section === "policies" && <AdminPolicies />}
              {section === "calendar" && <AdminCalendar />}
              {section === "bank" && <AdminBank />}
              {section === "settings" && <AdminSettings />}
            </View>
          </View>
        </View>
      ) : (
        <Text style={ui.error}>Cần quyền ADMIN.</Text>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  layout: { flexDirection: "row", alignItems: "flex-start", gap: 18 }, layoutCompact: { flexDirection: "column" },
  sidebar: { width: 230, backgroundColor: "#fff", borderRadius: 22, borderWidth: 1, borderColor: "#e8edf5", padding: 16, gap: 14 }, sidebarCompact: { width: "100%" },
  menuTitle: { color: "#94a3b8", fontSize: 11, fontWeight: "800", letterSpacing: 0.7 }, menu: { gap: 5 }, menuCompact: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  menuItem: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 9, borderRadius: 14 }, menuItemCompact: { flexGrow: 1, flexBasis: 150 }, menuItemActive: { backgroundColor: "#3658dc" },
  menuIcon: { width: 33, height: 33, alignItems: "center", justifyContent: "center", backgroundColor: "#f1f5f9", borderRadius: 11 }, menuIconActive: { backgroundColor: "#ffffff30" }, menuLabel: { flex: 1, color: "#475569", fontSize: 13, fontWeight: "700" }, menuLabelActive: { color: "#fff" },
  main: { flex: 1, minWidth: 0, backgroundColor: "#f4f6fb", borderRadius: 22, overflow: "hidden" }, mainCompact: { width: "100%" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, padding: 8 }, refreshButton: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, paddingVertical: 6 }, refreshText: { color: "#3457df", fontSize: 13, fontWeight: "700" },
  topbar: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e8edf5", padding: 18 }, topTitle: { fontSize: 21, fontWeight: "800", color: "#0f172a" },
  body: { padding: 18, gap: 16 }, overview: { gap: 16 }, heading: { fontSize: 23, fontWeight: "800", color: "#0f172a" }, subtitle: { fontSize: 13, color: "#64748b", lineHeight: 20, marginTop: 4 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, metric: { flexGrow: 1, flexBasis: 170, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e8edf5", borderRadius: 20, padding: 16, gap: 12 },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }, metricLabel: { color: "#64748b", fontWeight: "600", fontSize: 13, flexShrink: 1 }, metricIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" },
  metricValue: { color: "#0f172a", fontSize: 28, fontWeight: "800" }, metricDescription: { color: "#94a3b8", fontSize: 12, lineHeight: 19 }, sectionTitle: { color: "#0f172a", fontSize: 17, fontWeight: "700" },
  chartColumns: { flexDirection: "row", flexWrap: "wrap", gap: 28, paddingVertical: 16 }, chartBars: { flexGrow: 1, flexBasis: 240, gap: 16 }, chartRow: { gap: 7 }, chartLegend: { flexDirection: "row", justifyContent: "space-between" }, chartValue: { fontWeight: "700", color: "#334155" }, chartTrack: { height: 14, backgroundColor: "#edf2f7", borderRadius: 8, overflow: "hidden" },
  donutRow: { flexDirection: "row", alignItems: "center", gap: 18, flexWrap: "wrap" }, donut: { width: 148, height: 148, alignItems: "center", justifyContent: "center" }, donutCenter: { position: "absolute", alignItems: "center" }, donutTotal: { color: "#0f172a", fontSize: 26, fontWeight: "800" }, legendText: { fontWeight: "700", fontSize: 13 },
});
