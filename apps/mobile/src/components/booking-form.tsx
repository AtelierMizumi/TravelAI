import { useRealtime } from "@/hooks/use-realtime";
import { operationAttempt } from "@/services/attempt";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Switch, Text, View } from "react-native";
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
import { api, operationKey } from "@/services/api";
import { useResource } from "@/hooks/use-resource";
import type { Booking, Offer, Review, Selection } from "@/services/types";

export function BookingForm({
  offer,
  current,
}: {
  offer: Offer;
  current?: Booking;
}) {
  const old = current?.itinerary.selection;
  const [departure, setDeparture] = useState(old?.departure || "");
  const [checkIn, setCheckIn] = useState(old?.checkIn || "");
  const [checkOut, setCheckOut] = useState(old?.checkOut || "");
  const [guests, setGuests] = useState(String(old?.guests || 1));
  const [seats, setSeats] = useState<string[]>(old?.seats || []);
  const [roomGuests, setRoomGuests] = useState<Record<string, number>>(
    old?.roomGuests || {},
  );
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const action = useAction();
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  const availability = useResource<Record<string, number>>(
    `/booking/offers/${encodeURIComponent(offer.id)}/availability${current ? `?bookingId=${encodeURIComponent(current.id)}` : ""}`,
    10_000,
  );
  const selectedDeparture = offer.departures?.find(
    (item) => item.start === departure,
  );
  function roomOccupied(roomId: string) {
    if (!checkIn || !checkOut || checkOut <= checkIn) return false;
    const prefix = `${offer.id}|R|${roomId}|`;
    return Object.entries(availability.data || {}).some(([key, used]) => {
      const date = key.slice(prefix.length);
      return (
        key.startsWith(prefix) && used > 0 && date >= checkIn && date < checkOut
      );
    });
  }
  useRealtime(availability.reload, `/topic/inventory/${offer.id}`);
  async function review() {
    const selection: Selection = {
      offeringId: offer.id,
      bookingId: current?.id,
      bookingRevision: current?.revision,
      departure: offer.kind === "TOUR" ? departure : undefined,
      checkIn: offer.kind === "HOTEL" ? checkIn : undefined,
      checkOut: offer.kind === "HOTEL" ? checkOut : undefined,
      guests: Number(guests),
      seats,
      roomGuests,
      replacementRooms: pairs,
    };
    attempt.current = operationAttempt(
      attempt.current,
      selection,
      operationKey,
    );
    const result = await api<Review>("/booking/reviews", {
      method: "POST",
      body: selection,
      key: attempt.current.key,
    });
    router.push({
      pathname: "/booking/payment",
      params: { review: result.id },
    });
  }
  return (
    <Card>
      <Text style={ui.heading}>
        {current ? "Chọn lịch và chỗ mới" : "Chọn lịch và chỗ"}
      </Text>
      {current && (
        <Text style={ui.text}>
          Lịch hiện tại {serviceTime(current.itinerary.start)}. Số người được
          giữ nguyên {old?.guests}. Phí đổi lịch bằng 20% số tiền đặt ban đầu.
          Chênh lệch dương chỉ áp dụng ngày lễ Việt Nam. Chênh lệch âm không
          được hoàn.
        </Text>
      )}
      <Field
        label="Số khách"
        value={guests}
        onChangeText={setGuests}
        keyboardType="number-pad"
        editable={!current}
      />
      {offer.kind === "TOUR" ? (
        <>
          {offer.departures?.map((item) => (
            <Action
              key={item.start}
              secondary={departure !== item.start}
              title={`${departure === item.start ? "✓ " : ""}${serviceTime(item.start)} · ${money(item.price)}/khách`}
              onPress={() => {
                setDeparture(item.start);
                setSeats([]);
              }}
            />
          ))}
          {!!selectedDeparture?.seats?.length && (
            <View style={ui.row}>
              {selectedDeparture.seats.map((seat) => {
                const resource = `${offer.id}|T|${departure}|${seat}`;
                const retained =
                  current?.itinerary.start === departure &&
                  old?.seats?.includes(seat);
                const occupied =
                  (availability.data?.[resource] || 0) > 0 && !retained;
                return (
                  <Action
                    key={seat}
                    disabled={occupied}
                    secondary={!seats.includes(seat)}
                    title={`Ghế ${seat}${occupied ? " · đã giữ" : ""}`}
                    onPress={() =>
                      setSeats((value) =>
                        value.includes(seat)
                          ? value.filter((item) => item !== seat)
                          : [...value, seat],
                      )
                    }
                  />
                );
              })}
            </View>
          )}
          {selectedDeparture && !selectedDeparture.seats?.length && (
            <Text style={ui.text}>
              Sức chứa {selectedDeparture.capacity}. Chỗ đã giữ{" "}
              {availability.data?.[`${offer.id}|T|${departure}`] || 0}. Server
              kiểm tra lại trước thanh toán.
            </Text>
          )}
        </>
      ) : (
        <>
          <Field
            label="Ngày nhận phòng (YYYY-MM-DD)"
            value={checkIn}
            onChangeText={setCheckIn}
            placeholder="YYYY-MM-DD"
          />
          <Field
            label="Ngày trả phòng (YYYY-MM-DD)"
            value={checkOut}
            onChangeText={setCheckOut}
            placeholder="YYYY-MM-DD"
          />
          <Text style={ui.text}>
            Nhận phòng {offer.checkInTime}, trả phòng {offer.checkOutTime}, múi
            giờ Asia/Ho_Chi_Minh. Server kiểm tra từng đêm phòng trước khi tạo
            lượt xem lại.
          </Text>
          {offer.rooms?.map((room) => (
            <Card key={room.id}>
              <View style={ui.row}>
                <Switch
                  value={room.id in roomGuests}
                  disabled={roomOccupied(room.id)}
                  accessibilityLabel={`Chọn phòng ${room.number}`}
                  onValueChange={(selected) => {
                    setRoomGuests((value) => {
                      const next = { ...value };
                      if (selected) next[room.id] = 0;
                      else delete next[room.id];
                      return next;
                    });
                    setPairs((value) => {
                      const next = { ...value };
                      delete next[room.id];
                      return next;
                    });
                  }}
                />
                <Text style={ui.text}>
                  Phòng {room.number} · tối đa {room.maxGuests} khách ·{" "}
                  {money(room.price)}/đêm ·{" "}
                  {roomOccupied(room.id)
                    ? "Đã có phòng được giữ trong khoảng ngày chọn"
                    : "Server chưa ghi nhận xung đột phòng với khoảng ngày chọn"}
                </Text>
              </View>
              {room.id in roomGuests && (
                <>
                  <Field
                    label={`Khách phòng ${room.number}`}
                    keyboardType="number-pad"
                    value={String(roomGuests[room.id])}
                    onChangeText={(value) =>
                      setRoomGuests((rooms) => ({
                        ...rooms,
                        [room.id]: Number(value),
                      }))
                    }
                  />
                  {current && (
                    <>
                      <Text style={ui.text}>
                        Ghép với phòng cũ để so giá từng đêm. Hiện chọn{" "}
                        {pairs[room.id] || "phòng bổ sung"}.
                      </Text>
                      <Action
                        secondary
                        title="Phòng bổ sung, không ghép"
                        onPress={() =>
                          setPairs((value) => {
                            const next = { ...value };
                            delete next[room.id];
                            return next;
                          })
                        }
                      />
                      {Object.keys(old?.roomGuests || {}).map((previous) => (
                        <Action
                          secondary={pairs[room.id] !== previous}
                          key={previous}
                          title={`Ghép phòng cũ ${offer.rooms.find((item) => item.id === previous)?.number || previous}`}
                          onPress={() =>
                            setPairs((value) => ({
                              ...value,
                              [room.id]: previous,
                            }))
                          }
                        />
                      ))}
                    </>
                  )}
                </>
              )}
            </Card>
          ))}
        </>
      )}
      <ErrorText message={availability.error || action.error} />
      <Action
        title="Kiểm tra chỗ và xem lại thanh toán"
        disabled={
          action.busy || !Number.isInteger(Number(guests)) || Number(guests) < 1
        }
        onPress={() => action.run(review)}
      />
    </Card>
  );
}
