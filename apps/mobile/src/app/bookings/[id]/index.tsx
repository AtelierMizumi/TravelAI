import { RatingForm } from "@/components/ratings";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Switch, Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
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
import type { Booking } from "@/services/types";
interface History {
  reference: string;
  action: string;
  createdAt: string;
  details: unknown;
}
export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const bookings = useResource<Booking[]>(user ? "/booking/bookings" : null);
  const history = useResource<History[]>(
    user ? `/booking/bookings/${encodeURIComponent(id)}/history` : null,
  );
  const booking = bookings.data?.find((item) => item.id === id);
  const action = useAction();
  const [confirm, setConfirm] = useState(false);
  const [refund, setRefund] = useState<{ refund: number; fee: number } | null>(
    null,
  );
  const key = useRef<string | null>(null);
  return (
    <Screen title="Chi tiết đặt chỗ" protected>
      <ErrorText message={bookings.error || history.error || action.error} />
      {booking && (
        <Card>
          <Text style={ui.heading}>
            {booking.itinerary.name} · {booking.status}
          </Text>
          <Text style={ui.text}>
            {booking.id} · {serviceTime(booking.itinerary.start)} →{" "}
            {serviceTime(booking.itinerary.end)}
          </Text>
          <Text style={ui.text}>
            {booking.itinerary.selection.guests} khách · ghế{" "}
            {booking.itinerary.selection.seats?.join(", ") || "không áp dụng"}
          </Text>
          {Object.entries(booking.itinerary.selection.roomGuests || {}).map(
            ([room, guests]) => (
              <Text key={room} style={ui.text}>
                Phòng {room} · {guests} khách
              </Text>
            ),
          )}
          <Text style={ui.text}>
            Đặt ban đầu {money(booking.originalAmount)} · tổng đã thanh toán{" "}
            {money(booking.totalPaid)}
          </Text>
          <Text style={ui.text}>
            Chính sách đã lưu {booking.itinerary.offeringVersion}. Hạn đổi lịch
            trước {booking.itinerary.changeHours} giờ. Hạn hủy trước{" "}
            {booking.itinerary.policy.cancellationHours} giờ.
          </Text>
          {booking.status === "CONFIRMED" && (
            <>
              <Nav
                href={{ pathname: "/bookings/[id]/reschedule", params: { id } }}
              >
                Đổi ngày/giờ và chọn chỗ mới
              </Nav>
              <Text style={ui.text}>
                Hủy tự nguyện hợp lệ hoàn 65% tổng thanh toán SIMULATED thành
                công, giữ phí 35%. Server kiểm tra điều kiện trước khi hủy.
              </Text>
              <View style={ui.row}>
                <Switch
                  accessibilityLabel="Xác nhận hủy với chính sách 65% hoàn, 35% phí"
                  value={confirm}
                  onValueChange={setConfirm}
                />
                <Text style={[ui.text, { flex: 1 }]}>
                  Tôi xác nhận yêu cầu hủy theo chính sách này.
                </Text>
              </View>
              <Action
                secondary
                title="Hủy đặt chỗ"
                disabled={!confirm || action.busy}
                onPress={() =>
                  action.run(async () => {
                    key.current ||= operationKey();
                    const result = await api<{ refund: number; fee: number }>(
                      `/booking/bookings/${id}/cancel`,
                      {
                        method: "POST",
                        body: { reason: "VOLUNTARY" },
                        key: key.current,
                      },
                    );
                    setRefund(result);
                    setConfirm(false);
                    bookings.reload();
                    history.reload();
                  })
                }
              />
            </>
          )}
        </Card>
      )}
      {booking?.status === "CONFIRMED" && <RatingForm bookingId={booking.id} />}
      {refund && (
        <Card>
          <Text style={ui.text}>
            Hoàn {money(refund.refund)} · phí {money(refund.fee)}
          </Text>
        </Card>
      )}
      <Text style={ui.heading}>Lịch sử đầy đủ</Text>
      {history.data?.map((item) => (
        <Card key={item.reference}>
          <Text style={ui.heading}>{item.action}</Text>
          <Text style={ui.text}>{serviceTime(item.createdAt)}</Text>
          <Text selectable style={ui.text}>
            SIMULATED · {JSON.stringify(item.details, null, 2)}
          </Text>
        </Card>
      ))}
    </Screen>
  );
}
