import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { BookingForm } from "@/components/booking-form";
import { ErrorText, Screen, ui } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import type { Booking, Offer } from "@/services/types";
export default function Reschedule() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const bookings = useResource<Booking[]>(user ? "/booking/bookings" : null);
  const offers = useResource<Offer[]>("/booking/offers");
  const booking = bookings.data?.find((item) => item.id === id);
  const offer = offers.data?.find(
    (item) => item.id === booking?.itinerary.selection.offeringId,
  );
  return (
    <Screen title="Đổi lịch đặt chỗ" protected>
      <ErrorText message={bookings.error || offers.error} />
      {booking?.status === "CONFIRMED" && offer ? (
        <BookingForm key={booking.revision} offer={offer} current={booking} />
      ) : (
        <Text style={ui.text}>
          Đang tải hoặc đặt chỗ không đủ điều kiện đổi lịch.
        </Text>
      )}
    </Screen>
  );
}
