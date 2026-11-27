import { destinationFor } from "@/services/catalog-media";
import { CatalogPhoto } from "@/components/catalog-photo";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { Ratings } from "@/components/ratings";
import { MapsLink } from "@/components/maps-link";
import { BookingForm } from "@/components/booking-form";
import { ErrorText, money, Nav, Screen, ui } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useMembership } from "@/context/membership";
import { useResource } from "@/hooks/use-resource";
import {
  MONETIZATION_ACCENTS,
  computeMemberPrice,
  getTierPalette,
  vipTeaserPrice,
} from "@/services/monetization-helpers";
import type { CatalogItem, Offer, Place } from "@/services/types";

export function CatalogDetail({ kind }: { kind: "tours" | "hotels" }) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const membership = useMembership();
  const palette = getTierPalette(membership.tier);
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
      <CatalogPhoto
        key={`${id}:${item.data?.image || ""}`}
        source={item.data?.image}
        fallback={
          kind === "tours"
            ? destinationFor(item.data?.location, places.data || [])?.imageUrl
            : undefined
        }
        label={item.data?.name || "Dịch vụ"}
        height={320}
      />
      <Text style={ui.text}>{item.data?.location}</Text>
      <Text style={ui.text}>{item.data?.description}</Text>
      {item.data?.price != null && (() => {
        const pricing = computeMemberPrice(item.data.price, membership.discountPercent);
        const teaser = vipTeaserPrice(item.data.price);
        if (membership.isPremium && pricing.hasDiscount) {
          return (
            <View
              style={{
                backgroundColor: palette.cardBg,
                borderColor: palette.cardBorder,
                borderWidth: 2,
                borderRadius: 18,
                padding: 16,
                gap: 8,
              }}
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <View
                  style={{
                    backgroundColor: palette.badgeBg,
                    borderColor: palette.badgeBorder,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: palette.badgeText, fontSize: 12, fontWeight: "900" }}>
                    {membership.badge} · Đặc quyền {membership.planName}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: MONETIZATION_ACCENTS.savingsBg,
                    borderColor: MONETIZATION_ACCENTS.savingsBorder,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text style={{ color: MONETIZATION_ACCENTS.savingsText, fontSize: 12, fontWeight: "800" }}>
                    Tiết kiệm {money(pricing.savedAmount)} (-{membership.discountPercent}%)
                  </Text>
                </View>
              </View>
              <Text style={{ color: "#64748b", fontSize: 14, textDecorationLine: "line-through", fontWeight: "600" }}>
                Giá niêm yết: {money(pricing.originalPrice)}
              </Text>
              <Text style={{ color: palette.priceText, fontSize: 20, fontWeight: "900" }}>
                Giá Hội viên của bạn: {money(pricing.memberPrice)}
              </Text>
            </View>
          );
        }
        return (
          <Nav href="/subscriptions">
            {`🔒 Hội viên Explorer VIP chỉ trả ${money(teaser.vipPrice)} (tiết kiệm ${money(teaser.savedAmount)}) → Nâng cấp ngay`}
          </Nav>
        );
      })()}
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
