import { type PropsWithChildren, useEffect, useRef, useState } from "react";
import { PinTabs } from "@/components/pin-ui";
import { Ionicons } from "@expo/vector-icons";
import { useRealtime } from "@/hooks/use-realtime";
import Animated, { useReducedMotion, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Pressable, Text, View } from "react-native";
import {
  Action,
  ErrorText,
  Nav,
  Screen,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Notification } from "@/services/types";
export default function Notifications() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const resource = useResource<Notification[]>(
    user ? `/notifications/${user.id}` : null,
    5000,
  );
  const adminResource = useResource<Notification[]>(user?.role === "ADMIN" ? "/notifications/0" : null, 5000);
  const action = useAction();
  const refresh = () => { resource.reload(); adminResource.reload(); };
  useRealtime(refresh);
  async function mutate(path: string, method: string) {
    await api(path, { method });
    refresh();
  }
  const items = [...(resource.data || []), ...(adminResource.data || [])]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const visible = items.filter(item => filter !== "unread" || !item.isRead);
  return (
    <Screen title="Thông báo" protected>
      <Text style={ui.text}>Cập nhật chuyến đi, tin nhắn và hoạt động cộng đồng của bạn.</Text>
      <PinTabs value={filter} onChange={setFilter} tabs={[{ id: "all", label: `Tất cả (${items.length})` }, { id: "unread", label: `Chưa đọc (${items.filter(item => !item.isRead).length})` }]} />
      <ErrorText message={resource.error || adminResource.error || action.error} />
      <Action
        secondary
        title="Đánh dấu tất cả đã đọc"
        disabled={action.busy || !user}
        onPress={() =>
          action.run(async () => {
            await mutate(`/notifications/read-all/${user!.id}`, "PUT");
            if (user?.role === "ADMIN") await mutate("/notifications/read-all/0", "PUT");
          })
        }
      />
      {resource.data && visible.length === 0 && (
        <Text style={ui.text}>Không có thông báo trong mục này.</Text>
      )}
      {visible.map((item) => (
        <NotificationPanel key={item.id} item={item}>
          <Text style={ui.text}>{item.message}</Text>
          <Text style={ui.text}>{item.isRead ? "Đã đọc" : "Chưa đọc"}</Text>
          {item.targetReference && (item.type.startsWith("BOOKING_") || item.type.startsWith("REMINDER_")) ? (
            <Nav href={{ pathname: "/bookings/[id]", params: { id: item.targetReference } }}>Mở đặt chỗ</Nav>
          ) : item.type === "MESSAGE" ? (
            <Nav
              href={{ pathname: "/messages", params: { peer: item.targetId } }}
            >
              Mở tin nhắn
            </Nav>
          ) : item.type.includes("POST") ||
            item.type === "LIKE" ||
            item.type === "COMMENT" ? (
            <Nav href="/feed">Mở cộng đồng</Nav>
          ) : (
            <Nav href="/profile">Mở hồ sơ</Nav>
          )}
          <View style={ui.row}>
          {!item.isRead && (
            <Action
              secondary
              title="Đã đọc"
              disabled={action.busy}
              onPress={() =>
                action.run(() =>
                  mutate(`/notifications/read/${item.id}`, "PUT"),
                )
              }
            />
          )}
          <Action
            secondary
            title="Xóa thông báo"
            disabled={action.busy}
            onPress={() =>
              action.run(() => mutate(`/notifications/${item.id}`, "DELETE"))
            }
          />
          </View>
        </NotificationPanel>
      ))}
    </Screen>
  );
}

/** Presentation-only disclosure; read/delete mutations remain owned by the screen. */
function NotificationPanel({ item, children }: PropsWithChildren<{ item: Notification }>) {
  const [expanded, setExpanded] = useState(true);
  const [mounted, setMounted] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function toggle() {
    if (timer.current) clearTimeout(timer.current);
    const next = !expanded;
    setExpanded(next);
    if (next) setMounted(true);
    opacity.set(withTiming(next ? 1 : 0, { duration: reducedMotion ? 0 : 150 }));
    if (!next) {
      if (reducedMotion) setMounted(false);
      else timer.current = setTimeout(() => setMounted(false), 150);
    }
  }
  return <View testID={`notification-${item.id}`} style={[ui.card, { width: "100%", maxWidth: 760, alignSelf: "center", padding: 14, borderRadius: 16, gap: 10, borderColor: item.isRead ? "#dce7ee" : "#8bc8e2", backgroundColor: item.isRead ? "#ffffff" : "#f0f9ff", shadowOpacity: 0.04, shadowRadius: 10 }]}>
    <Pressable accessibilityRole="button" accessibilityLabel={item.title} accessibilityState={{ expanded }} onPress={toggle}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, opacity: pressed ? 0.65 : 1, borderRadius: 10, minHeight: 44 })}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: item.isRead ? "#eef3f7" : "#d6edfa", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={item.type === "MESSAGE" ? "chatbubble-outline" : item.type.startsWith("BOOKING_") ? "calendar-outline" : "notifications-outline"} color="#087fba" size={18} />
      </View>
      <View style={{ flex: 1, gap: 3 }}><Text style={[ui.heading, { fontSize: 15, fontWeight: item.isRead ? "600" : "800" }]}>{item.title}</Text><Text style={{ color: "#526c80", fontSize: 12 }}>{new Date(item.createdAt).toLocaleString("vi-VN")}</Text></View>
      {!item.isRead && <Text accessibilityLabel="Chưa đọc" style={{ color: "#087fba" }}>●</Text>}
      <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={17} color="#426a83" />
    </Pressable>
    {mounted && <Animated.View pointerEvents={expanded ? "auto" : "none"} aria-hidden={!expanded} style={[{ gap: 8 }, fade]}>{children}</Animated.View>}
  </View>;
}
