import { useRealtime } from "@/hooks/use-realtime";
import { Text } from "react-native";
import {
  Action,
  Card,
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
  return (
    <Screen title="Thông báo" protected>
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
      {resource.data && items.length === 0 && (
        <Text style={ui.text}>Chưa có thông báo.</Text>
      )}
      {items.map((item) => (
        <Card key={item.id}>
          <Text style={ui.heading}>{item.title}</Text>
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
        </Card>
      ))}
    </Screen>
  );
}
