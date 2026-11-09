import { useState } from "react";
import { Text, View } from "react-native";
import { Action, Card, ErrorText, Screen, ui } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { AdminUsers } from "@/components/admin/users";
import { AdminCatalog } from "@/components/admin/catalog";
import { AdminPosts } from "@/components/admin/moderation";
import { AdminSettings } from "@/components/admin/settings";
import { AdminPolicies, AdminCalendar } from "@/components/admin/policies";
import { AdminBank } from "@/components/admin/bank";
import { AdminBookings } from "@/components/admin/bookings";
const sections = [
  ["stats", "Tổng quan"],
  ["users", "Người dùng"],
  ["tours", "Tour"],
  ["hotels", "Khách sạn"],
  ["places", "Điểm đến"],
  ["posts", "Duyệt bài"],
  ["bookings", "Đặt chỗ"],
  ["policies", "Chính sách và tồn chỗ"],
  ["calendar", "Lịch lễ"],
  ["bank", "Ngân hàng SIMULATED"],
  ["settings", "Hệ thống"],
] as const;
function Stats() {
  const resource = useResource<Record<string, number>>("/admin/stats");
  return (
    <>
      <ErrorText message={resource.error} />
      {resource.data && (
        <Card>
          {Object.entries(resource.data).map(([key, value]) => (
            <Text key={key} style={ui.text}>
              {key} · {value}
            </Text>
          ))}
        </Card>
      )}
    </>
  );
}
export default function Admin() {
  const { user } = useAuth();
  const [section, setSection] = useState<string>("stats");
  return (
    <Screen title="Quản trị TravelAI" protected>
      {user?.role === "ADMIN" ? (
        <>
          <View style={ui.row}>
            {sections.map(([key, label]) => (
              <Action
                key={key}
                secondary={section !== key}
                title={label}
                onPress={() => setSection(key)}
              />
            ))}
          </View>
          {section === "stats" && <Stats />}
          {section === "users" && <AdminUsers />}
          {(section === "tours" ||
            section === "hotels" ||
            section === "places") && (
            <AdminCatalog key={section} kind={section} />
          )}
          {section === "posts" && <AdminPosts />}
          {section === "bookings" && <AdminBookings />}
          {section === "policies" && <AdminPolicies />}
          {section === "calendar" && <AdminCalendar />}
          {section === "bank" && <AdminBank />}
          {section === "settings" && <AdminSettings />}
        </>
      ) : (
        <Text style={ui.error}>Cần quyền ADMIN.</Text>
      )}
    </Screen>
  );
}
