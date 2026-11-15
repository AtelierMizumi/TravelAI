import { PaymentResult } from "@/components/payment-result";
import { operationAttempt } from "@/services/attempt";
import { useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { Switch, Text, View } from "react-native";
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
import { api, ApiError, operationKey } from "@/services/api";
import type { Bank, Booking, Itinerary, Offer, Review } from "@/services/types";
function ItinerarySummary({
  title,
  itinerary,
}: {
  title: string;
  itinerary: Itinerary;
}) {
  return (
    <Card>
      <Text style={ui.heading}>
        {title} · {itinerary.name}
      </Text>
      <Text style={ui.text}>
        {serviceTime(itinerary.start)} → {serviceTime(itinerary.end)} ·{" "}
        {itinerary.timezone}
      </Text>
      <Text style={ui.text}>{itinerary.selection.guests} khách</Text>
      <Text style={ui.text}>
        Ghế {itinerary.selection.seats?.join(", ") || "không áp dụng"}
      </Text>
      {Object.entries(itinerary.selection.roomGuests || {}).map(
        ([room, guests]) => (
          <Text key={room} style={ui.text}>
            Phòng {room} · {guests} khách · ghép phòng cũ{" "}
            {itinerary.selection.replacementRooms?.[room] || "không ghép"}
          </Text>
        ),
      )}
      <Text style={ui.text}>
        Chính sách {itinerary.offeringVersion}. Đổi lịch trước{" "}
        {itinerary.changeHours} giờ, hủy trước{" "}
        {itinerary.policy.cancellationHours} giờ. Hạn đổi lịch{" "}
        {serviceTime(
          new Date(
            new Date(itinerary.start).getTime() -
              itinerary.changeHours * 3_600_000,
          ).toISOString(),
        )}
        . Yêu cầu phải đến server trước thời điểm này.
      </Text>
    </Card>
  );
}
export default function Payment() {
  const { review: id } = useLocalSearchParams<{ review?: string }>();
  const { user } = useAuth();
  const review = useResource<Review>(
    user && id ? `/booking/reviews/${encodeURIComponent(id)}` : null,
  );
  const bank = useResource<Bank>(user ? "/booking/bank" : null);
  const offers = useResource<Offer[]>("/booking/offers");
  const [declined, setDeclined] = useState("");
  const [card, setCard] = useState("");
  const [cvv, setCvv] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [paid, setPaid] = useState<Booking | null>(null);
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  const action = useAction();
  async function pay() {
    if (!review.data || !confirmed) return;
    attempt.current = operationAttempt(
      attempt.current,
      { digest: review.data.digest, confirmed: true, cardId: card },
      operationKey,
    );
    const result = await api<Booking & { message?: string }>(
      `/booking/reviews/${review.data.id}/pay`,
      {
        method: "POST",
        body: {
          digest: review.data.digest,
          confirmed: true,
          cardId: card,
          testCvv: cvv,
        },
        key: attempt.current.key,
      },
    );
    if (result.status !== "CONFIRMED") {
      attempt.current = null;
      setCvv("");
      setConfirmed(false);
      setDeclined(result.message || "Thanh toán SIMULATED thất bại.");
      bank.reload();
      return;
    }
    setCvv("");
    setPaid(result);
    bank.reload();
  }
  const data = review.data;
  const completed = paid || data?.booking;
  return (
    <Screen title="Xem lại và thanh toán SIMULATED" protected>
      <ErrorText message={review.error || bank.error || action.error} />
      {!id && (
        <Text style={ui.text}>
          Chọn tour hoặc khách sạn và tạo lượt xem lại trước.
        </Text>
      )}
      {completed ? (
        <Card>
          <PaymentResult success />
          <Text style={ui.heading}>
            {completed.status} · {completed.id}
          </Text>
          <Text style={ui.text}>
            Giao dịch thanh toán đã được ghi nhận. Tổng đã trả{" "}
            {money(completed.totalPaid)}.
          </Text>
          <Nav href="/profile">Xem lịch sử đặt chỗ</Nav>
        </Card>
      ) : (
        data && (
          <>
            {!!declined && (
              <Card>
                <PaymentResult success={false} message={declined} />
                <Action
                  secondary
                  title="Đóng để thử lại"
                  onPress={() => setDeclined("")}
                />
                <Nav href="/profile">Xem lịch sử thanh toán</Nav>
              </Card>
            )}
            {data.status !== "PENDING" && (
              <Card>
                <Text style={ui.text}>
                  Lượt giữ chỗ đã hết hạn hoặc không còn hiệu lực. Vui lòng chọn
                  lại lịch và chỗ; hệ thống sẽ kiểm tra lại trước khi thanh
                  toán.
                </Text>
                {data.quote.itinerary.selection.bookingId ? (
                  <Nav
                    href={{
                      pathname: "/bookings/[id]/reschedule",
                      params: { id: data.quote.itinerary.selection.bookingId },
                    }}
                  >
                    Chọn lại lịch đổi
                  </Nav>
                ) : (
                  (() => {
                    const offer = offers.data?.find(
                      (value) =>
                        value.id === data.quote.itinerary.selection.offeringId,
                    );
                    return offer?.legacyId ? (
                      <Nav
                        href={{
                          pathname:
                            offer.kind === "TOUR"
                              ? "/booking/tours/[id]"
                              : "/booking/hotels/[id]",
                          params: { id: offer.legacyId },
                        }}
                      >
                        Chọn lại lịch và chỗ
                      </Nav>
                    ) : (
                      <Nav href="/booking/tours">Xem dịch vụ</Nav>
                    );
                  })()
                )}
              </Card>
            )}
            {data.originalItinerary && (
              <ItinerarySummary
                title="Lịch đang xác nhận"
                itinerary={data.originalItinerary}
              />
            )}
            <ItinerarySummary
              title="Lịch đã chọn"
              itinerary={data.quote.itinerary}
            />
            <Card>
              <Text style={ui.text}>
                Trạng thái {data.status}. Giữ chỗ đến{" "}
                {serviceTime(data.expiresAt)}. Tình trạng chỗ đã được server
                kiểm tra khi tạo lượt xem lại và sẽ kiểm tra lại trong giao dịch
                thanh toán.
              </Text>
              <Text style={ui.text}>
                Giá đặt ban đầu {money(data.quote.originalAmount)}
              </Text>
              <Text style={ui.text}>
                Phí đổi lịch 20% giá ban đầu {money(data.quote.fee)}
              </Text>
              <Text style={ui.text}>
                Phân loại ngày đến{" "}
                {data.quote.holiday
                  ? "Ngày lễ chính thức Việt Nam"
                  : "Ngày thường / không có lịch lễ được duyệt cho đặt mới"}
              </Text>
              <Text style={ui.text}>
                Chênh lệch dương ngày lễ {money(data.quote.holidayDifference)}
              </Text>
              {data.quote.nights.map((night) => (
                <Text key={`${night.room}/${night.date}`} style={ui.text}>
                  {night.date} · phòng {night.room} ·{" "}
                  {night.holiday ? "ngày lễ" : "ngày thường"} · giá mới{" "}
                  {money(night.price)} · giá cũ{" "}
                  {night.baseline === null
                    ? "phòng/đêm bổ sung"
                    : money(night.baseline)}{" "}
                  · phụ thu {money(night.additional)}
                </Text>
              ))}
              <Text style={ui.heading}>
                Tổng thanh toán {money(data.quote.total)}
              </Text>
              <Text style={ui.text}>
                Hủy tự nguyện hợp lệ hoàn 65%, giữ phí 35%. Đổi lịch rẻ hơn
                không hoàn chênh lệch âm.
              </Text>
              <Text style={ui.text}>Ngân hàng liên kết SIMULATED</Text>
              {bank.data?.cards.map((item) => (
                <Action
                  key={item.cardId}
                  title={`${item.bankName} · ${item.cardId} · ${item.status} · ${item.expiryMonth}/${item.expiryYear}`}
                  disabled={item.status !== "ACTIVE"}
                  secondary={card !== item.cardId}
                  onPress={() => {
                    setCard(item.cardId);
                    setConfirmed(false);
                  }}
                />
              ))}
              {!bank.data?.cards.length && (
                <Nav href="/profile">Liên kết ngân hàng SIMULATED</Nav>
              )}
              <Field
                label="Mã thử nghiệm TEST-… được cấp cùng thẻ SIMULATED"
                value={cvv}
                onChangeText={setCvv}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={ui.row}>
                <Switch
                  value={confirmed}
                  onValueChange={setConfirmed}
                  accessibilityLabel="Xác nhận thông tin và chính sách thanh toán"
                />
                <Text style={[ui.text, { flex: 1 }]}>
                  Tôi xác nhận dịch vụ, lịch, số khách, chỗ chọn, tổng tiền
                  SIMULATED và chính sách hủy.
                </Text>
              </View>
              <Action
                title="Xác nhận thanh toán SIMULATED"
                disabled={
                  action.busy ||
                  !confirmed ||
                  !card ||
                  !cvv ||
                  data.status !== "PENDING"
                }
                onPress={() =>
                  action.run(async () => {
                    try {
                      await pay();
                    } catch (error) {
                      if (error instanceof ApiError && error.status === 409)
                        setConfirmed(false);
                      throw error;
                    }
                  })
                }
              />
              <Text style={ui.text}>
                Nếu kết nối bị gián đoạn, thử lại cùng yêu cầu để truy vấn kết
                quả. Nếu lịch/giá đã thay đổi, tạo lượt xem lại mới.
              </Text>
            </Card>
          </>
        )
      )}
    </Screen>
  );
}
