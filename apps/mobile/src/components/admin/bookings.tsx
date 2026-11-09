import { useRef, useState } from "react";
import { Text } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  money,
  Nav,
  serviceTime,
  ui,
  useAction,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, operationKey } from "@/services/api";
import type { Booking } from "@/services/types";
export function AdminBookings() {
  const resource = useResource<Booking[]>("/booking/bookings");
  const legacyTours = useResource<unknown[]>("/tour-bookings");
  const legacyHotels = useResource<unknown[]>("/hotel-bookings");
  return (
    <>
      <ErrorText
        message={resource.error || legacyTours.error || legacyHotels.error}
      />
      {resource.data?.map((booking) => (
        <BookingActions
          key={`${booking.id}/${booking.revision}`}
          booking={booking}
          reload={resource.reload}
        />
      ))}
      <Card>
        <Text style={ui.heading}>Hồ sơ tour/hotel cũ</Text>
        <Text selectable style={ui.text}>
          {JSON.stringify(
            [...(legacyTours.data || []), ...(legacyHotels.data || [])],
            null,
            2,
          )}
        </Text>
      </Card>
    </>
  );
}
function BookingActions({
  booking,
  reload,
}: {
  booking: Booking;
  reload: () => void;
}) {
  const [reason, setReason] = useState("");
  const [release, setRelease] = useState("");
  const [confirm, setConfirm] = useState("");
  const action = useAction();
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  async function mutate(operation: string, body: unknown) {
    const payload = JSON.stringify({ operation, body });
    if (!attempt.current || attempt.current.payload !== payload)
      attempt.current = { payload, key: operationKey() };
    await api(`/booking/bookings/${booking.id}/${operation}`, {
      method: "POST",
      body,
      key: attempt.current.key,
    });
    reload();
  }
  return (
    <Card>
      <Text style={ui.heading}>
        {booking.itinerary.name} · {booking.status}
      </Text>
      <Text style={ui.text}>
        Khách #{booking.ownerId} · {serviceTime(booking.itinerary.start)} ·{" "}
        {money(booking.totalPaid)}
      </Text>
      <Nav href={{ pathname: "/bookings/[id]", params: { id: booking.id } }}>
        Chi tiết và lịch sử
      </Nav>
      <Field
        label="Lý do xử lý"
        multiline
        value={reason}
        onChangeText={setReason}
      />
      <Field
        label="Nhập ID đặt chỗ để xác nhận thao tác"
        value={confirm}
        onChangeText={setConfirm}
        autoCapitalize="none"
      />
      <Text selectable style={ui.text}>
        {booking.id}
      </Text>
      <ErrorText message={action.error} />
      {booking.status === "CONFIRMED" && (
        <>
          <Action
            secondary
            title="Hủy do không cung cấp dịch vụ, hoàn 100% SIMULATED"
            disabled={action.busy || !reason.trim() || confirm !== booking.id}
            onPress={() =>
              action.run(() =>
                mutate("cancel", {
                  reason: "SERVICE_UNAVAILABLE",
                  description: reason,
                }),
              )
            }
          />
          <Text selectable style={ui.text}>
            Phân bổ hiện tại{" "}
            {JSON.stringify(booking.itinerary.resources || [], null, 2)}
          </Text>
          <Field
            label="Resource key tương lai có thể bán lại, mỗi key một dòng (để trống để giữ phân bổ)"
            multiline
            value={release}
            onChangeText={setRelease}
          />
          <Action
            secondary
            title="Ghi nhận no-show, hoàn 0 SIMULATED"
            disabled={action.busy || !reason.trim() || confirm !== booking.id}
            onPress={() =>
              action.run(() =>
                mutate("no-show", {
                  reason,
                  releaseResources: release
                    .split("\n")
                    .map((value) => value.trim())
                    .filter(Boolean),
                }),
              )
            }
          />
        </>
      )}
      {booking.status === "NO_SHOW" && (
        <Action
          title="Sửa no-show, khôi phục đủ chỗ"
          disabled={action.busy || !reason.trim() || confirm !== booking.id}
          onPress={() =>
            action.run(() => mutate("correct-no-show", { reason }))
          }
        />
      )}
    </Card>
  );
}
