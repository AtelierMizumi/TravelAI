import { destinationFor } from "@/services/catalog-media";
import { CatalogPhoto } from "@/components/catalog-photo";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import { Ratings } from "@/components/ratings";
import { MapsLink } from "@/components/maps-link";
import { BookingForm } from "@/components/booking-form";
import { ErrorText, money, Nav, Screen, ui } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useMembership } from "@/context/membership";
import { useResource } from "@/hooks/use-resource";
import { computeMemberPrice, vipTeaserPrice } from "@/services/monetization-helpers";
import type { CatalogItem, Offer, Place } from "@/services/types";
export function CatalogDetail({ kind }: { kind: "tours" | "hotels" }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const membership = useMembership();
  const item = useResource<CatalogItem>(`/${kind}/${encodeURIComponent(id)}`);
  const offers = useResource<Offer[]>("/booking/offers");
  const places = useResource<Place[]>(kind === "tours" ? "/places" : null);
  const offer = offers.data?.find(
    (value) =>
      value.kind === (kind === "tours" ? "TOUR" : "HOTEL") &&
      String(value.legacyId) === id,
  );
  return (
    <Screen title={item.data?.name || "Chi tiết dịch vụ"}>
      <ErrorText message={item.error || offers.error} />
      <CatalogPhoto key={`${id}:${item.data?.image || ""}`} source={item.data?.image} fallback={kind === "tours" ? destinationFor(item.data?.location, places.data || [])?.imageUrl : undefined} label={item.data?.name || "Dịch vụ"} height={320} />
      <Text style={ui.text}>{item.data?.location}</Text>
      <Text style={ui.text}>{item.data?.description}</Text>
      {item.data?.price != null && (
        membership.isPremium ? (
          <Text
            style={{
              backgroundColor: "#1e1b4b",
              color: "#fde68a",
              padding: 14,
              borderRadius: 14,
              fontWeight: "800",
              borderWidth: 1.5,
              borderColor: "#f59e0b",
            }}
          >
            {`${membership.badge} Đặc quyền ${membership.planName}: Giá niêm yết ${money(item.data.price)} → Giá Hội viên của bạn chỉ còn ${money(computeMemberPrice(item.data.price, membership.discountPercent).memberPrice)} (-${membership.discountPercent}%, tiết kiệm ${money(computeMemberPrice(item.data.price, membership.discountPercent).savedAmount)})!`}
          </Text>
        ) : (
          <Nav href="/subscriptions">
            {`🔒 Hội viên Explorer VIP chỉ trả ${money(vipTeaserPrice(item.data.price).vipPrice)} (tiết kiệm ${money(vipTeaserPrice(item.data.price).savedAmount)}) → Nâng cấp ngay`}
          </Nav>
        )
      )}
      {!!offer?.promotion && (
        <Text style={[ui.text, { color: "#075782", fontWeight: "700" }]}>
          Ưu đãi giảm {offer.promotion.percent}% cho ngày sử dụng từ{" "}
          {offer.promotion.from} đến {offer.promotion.through} · SIMULATED. Tổng
          chính xác được xác nhận khi chọn lịch.
        </Text>
      )}
      {!!item.data?.location && (
        <MapsLink destination={`${item.data.name}, ${item.data.location}`} />
      )}
      {!!item.data && (
        <Ratings kind={kind === "tours" ? "TOUR" : "HOTEL"} id={id} />
      )}
      {!user ? (
        <Nav href="/login">Đăng nhập để chọn lịch và đặt chỗ</Nav>
      ) : offer ? (
        <BookingForm offer={offer} />
      ) : (
        !offers.loading && (
          <Text style={ui.text}>
            Dịch vụ chưa có lịch bán và chính sách được cấu hình. Vui lòng quay
            lại khi quản trị viên công bố.
          </Text>
        )
      )}
    </Screen>
  );
}
