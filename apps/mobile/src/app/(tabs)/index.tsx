import { useState } from "react";
import { MotionScroll } from "@/components/motion-scroll";
import { MotionEntry } from "@/components/motion-entry";
import { MotionIcon } from "@/components/motion-icon";
import { DestinationDeck } from "@/components/destination-deck";
import { ImageCredit } from "@/components/image-credit";
import { PinTaskCard } from "@/components/pin-ui";
import { SponsoredStrip } from "@/components/sponsored-strip";
import { landmarkCredit, landmarkImage } from "@/services/landmark-media";
import { useHydrated } from "@/hooks/use-hydrated";
import { HydrationSafeIonicon as Ionicons } from "@/components/hydration-safe-icon";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Footer } from "@/components/footer";
import { ErrorText } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useMembership } from "@/context/membership";
import { useResource } from "@/hooks/use-resource";
import { getTierPalette } from "@/services/monetization-helpers";
import type { CatalogItem, Offer, Place } from "@/services/types";

export default function Home() {
  const { user } = useAuth();
  const membership = useMembership();
  const palette = getTierPalette(membership.tier);
  const places = useResource<Place[]>("/places", 0, true);
  const offers = useResource<Offer[]>("/booking/offers", 0, true);
  const tours = useResource<CatalogItem[]>("/tours", 0, true);
  const hotels = useResource<CatalogItem[]>("/hotels", 0, true);
  const { width } = useWindowDimensions();
  const compact = !useHydrated() || width < 760;
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
  const featured = (offers.data || [])
    .flatMap((offer) => {
      const sale = offer.promotion;
      if (!offer.active || !sale || sale.through < today || !offer.legacyId)
        return [];
      if (
        offer.kind === "TOUR" &&
        !offer.departures?.some((d) => {
          const date = new Intl.DateTimeFormat("sv-SE", {
            timeZone: "Asia/Ho_Chi_Minh",
          }).format(new Date(d.start));
          return date >= today && date >= sale.from && date <= sale.through;
        })
      )
        return [];
      if (offer.kind === "HOTEL" && !offer.rooms?.length) return [];
      const item = (offer.kind === "TOUR" ? tours.data : hotels.data)?.find(
        (value) => value.id === offer.legacyId,
      );
      return item ? [{ offer, item, sale }] : [];
    })
    .slice(0, 4);
  return (
    <MotionScroll
      style={styles.page}
      contentContainerStyle={styles.container}
    >
      {membership.isPremium && (
        <View
          style={{
            backgroundColor: palette.heroBg,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: palette.heroBorder,
            padding: 20,
            marginBottom: 18,
            gap: 8,
          }}
        >
          <Text style={{ color: palette.heroEyebrow, fontSize: 12, fontWeight: "900", letterSpacing: 0.6 }}>
            👑 ĐẶC QUYỀN HỘI VIÊN ĐANG KÍCH HOẠT · {membership.planName.toUpperCase()}
          </Text>
          <Text style={{ color: palette.heroTitle, fontSize: 19, fontWeight: "800", lineHeight: 27 }}>
            Xin chào {user?.name || "Hội viên"}, mọi Tour & Khách sạn trên hệ thống đều đang giảm trực tiếp {membership.discountPercent}% cho riêng bạn!
          </Text>
          <Text style={{ color: palette.heroBody, fontSize: 14, lineHeight: 21 }}>
            Không giới hạn lượt nhận diện & hỏi đáp AI · Đã mở khóa Lập lịch trình AI VIP Concierge & Phòng chờ Ưu đãi VIP.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/ai-chat")}
              style={{
                backgroundColor: palette.heroCtaBg,
                paddingHorizontal: 15,
                paddingVertical: 11,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: palette.heroCtaText, fontWeight: "900", fontSize: 13 }}>
                ✨ Mở AI VIP Concierge →
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/subscriptions")}
              style={{
                backgroundColor: palette.heroSubBg,
                borderWidth: 1,
                borderColor: palette.heroBorder,
                paddingHorizontal: 15,
                paddingVertical: 11,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: palette.heroTitle, fontWeight: "800", fontSize: 13 }}>
                👑 Vào Phòng chờ VIP →
              </Text>
            </Pressable>
          </View>
        </View>
      )}
      <MotionEntry kind="hero"><View style={[styles.hero, compact && styles.heroCompact]}>
        <View

          style={[styles.heroCopy, compact && styles.heroCopyCompact]}
        >
          <View style={styles.eyebrow}>
            <MotionIcon name="sparkles" size={18} />
            <Text style={styles.eyebrowText}>KHÁM PHÁ VIỆT NAM CÙNG AI</Text>
          </View>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
            Đi để thấy,{" "}
            <Text style={styles.heroAccent}>chạm để khám phá.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Chụp điều khiến bạn tò mò. Khám phá điểm đến, tìm một nơi để ở và lên kế hoạch cho chuyến đi tiếp theo.
          </Text>
          <View style={styles.actions}>
            <Link href="/detection" asChild>
              <Pressable style={styles.primary}>
                <MotionIcon name="camera" color="#fff" size={22} />
                <Text style={styles.primaryText}>Chụp & khám phá</Text>
                <Ionicons name="arrow-forward" color="#fff" size={18} />
              </Pressable>
            </Link>
            <Link href="/booking/tours" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>Khám phá tour</Text>
                <Ionicons name="arrow-forward" color="#087fba" size={17} />
              </Pressable>
            </Link>
          </View>
          <View style={styles.heroFootnote}>
            <View style={styles.footnoteIcon}>
              <Ionicons name="flash" size={15} color="#087fba" />
            </View>
            <Text style={styles.footnoteText}>
              Một nơi cho cảm hứng và kế hoạch của bạn
            </Text>
          </View>
        </View>
        <View

          style={[styles.artwork, compact && styles.artworkCompact]}
        >
          <View >
            <DestinationDeck places={(places.data || []).filter(place => !!place.imageUrl).sort((a, b) => Number(!!landmarkCredit(b)) - Number(!!landmarkCredit(a))).slice(0, 8)} />
          </View>
        </View>
      </View></MotionEntry>
      <MotionEntry section="home-features"><View

        style={styles.featureBar}
      >
        <Feature
          icon="camera-outline"
          title="Nhận diện địa danh"
          description="Khám phá từ ảnh của bạn"
        />
        <Feature
          icon="map-outline"
          title="Lên đường dễ dàng"
          description="Tìm tour và khách sạn"
        />
        <Feature
          icon="people-outline"
          title="Kết nối cộng đồng"
          description="Chia sẻ trải nghiệm"
        />
      </View>
      </MotionEntry><MotionEntry section="home-actions"><View style={[styles.grid, { marginTop: 32 }]}>
        <PinTaskCard eyebrow="01 · NHÌN THẤY" title="Bạn đang ở đâu?" description="Mở camera, chụp địa danh trước mắt và tìm câu chuyện đằng sau bức ảnh." icon="camera-outline" action="Mở camera nhận diện" onPress={() => router.push("/detection")} />
        <PinTaskCard eyebrow="02 · TRẢI NGHIỆM" title="Đi theo cảm hứng" description="Tìm một hành trình phù hợp với điểm đến và khoảng thời gian của bạn." icon="compass-outline" action="Chọn tour cho bạn" onPress={() => router.push("/booking/tours")} />
        <PinTaskCard eyebrow="03 · NGHỈ NGƠI" title="Một nơi để trở về" description="Khám phá nơi lưu trú, tìm căn phòng yêu thích và chọn lịch nghỉ." icon="bed-outline" action="Tìm nơi lưu trú" onPress={() => router.push("/booking/hotels")} />
      </View>
      </MotionEntry><View style={{ marginTop: 28 }}><SponsoredStrip placement="HOME" title="Đề xuất nổi bật được tài trợ" /></View>{featured.length > 0 && (
        <>
      <MotionEntry section="home-offers"><View style={styles.destinationHeader}>
            <View>
              <Text style={styles.sectionOverline}>ƯU ĐÃI THEO LỊCH</Text>
              <Text style={styles.sectionTitle}>Chuyến đi đang chờ bạn</Text>
              <Text style={styles.sectionDescription}>
                Giảm giá áp dụng cho ngày sử dụng được ghi trên từng ưu đãi.
              </Text>
            </View>
          </View>
          </MotionEntry><View style={styles.grid}>
            {featured.map(({ offer, item, sale }) => (
              <View key={offer.id} style={styles.destinationCard} {...(Platform.OS === "web" ? { dataSet: { hoverSurface: "card" } } : {})}>
                <Link
                  href={{
                    pathname:
                      offer.kind === "TOUR"
                        ? "/booking/tours/[id]"
                        : "/booking/hotels/[id]",
                    params: { id: item.id },
                  }}
                  asChild
                >
                  <Pressable style={styles.placePressable}>
                    <View style={styles.placeImage}>
                      {!!item.image && (
                        <Image
                          source={{ uri: item.image }}
                          contentFit="cover"
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <View style={styles.placeTag}>
                        <Text style={styles.placeTagText}>
                          GIẢM {sale.percent}% · SIMULATED
                        </Text>
                      </View>
                    </View>
                    <View style={styles.placeBody}>
                      <Text style={styles.placeTitle}>{item.name}</Text>
                      <Text style={styles.placeDescription}>
                        {item.location}
                      </Text>
                      <Text style={styles.placeDescription}>
                        Áp dụng {sale.from} – {sale.through}
                      </Text>
                      <Text style={styles.placeLink}>Xem lịch và giá →</Text>
                    </View>
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        </>
      )}
      <MotionEntry section="home-destinations"><View style={styles.destinationHeader}>
        <View>
          <Text style={styles.sectionOverline}>CẢM HỨNG CHO BẠN</Text>
          <Text style={styles.sectionTitle}>Điểm đến nổi bật</Text>
          <Text style={styles.sectionDescription}>
            Những địa danh đang chờ bạn khám phá.
          </Text>
        </View>
        <Link href="/booking/tours" style={styles.sectionLink}>
          Xem tour →
        </Link>
      </View>
      </MotionEntry><ErrorText message={places.error} />
      {places.loading && !places.data && (
        <Text style={styles.empty}>Đang tải điểm đến…</Text>
      )}
      {places.data?.length === 0 && (
        <Text style={styles.empty}>Chưa có điểm đến được công bố.</Text>
      )}
      <View
        style={styles.grid}

      >
        {places.data?.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            compact={compact}
          />
        ))}
      </View>
      <MotionEntry section="home-footer"><Footer /></MotionEntry>
    </MotionScroll>
  );
}
function PlaceCard({ place, compact }: { place: Place; compact: boolean }) {
  const [pressed, setPressed] = useState(false);
  return <View style={[styles.destinationSlot, compact && styles.destinationCompact]}>
    <Link href={{ pathname: "/destination/[id]", params: { id: place.id } }} asChild>
      <Pressable style={styles.placePressable} onPressIn={() => setPressed(true)} onPressOut={() => setPressed(false)}>
        <View style={[styles.destinationCard, pressed && styles.destinationPressed]} {...(Platform.OS === "web" ? { dataSet: { hoverSurface: "card", featuredDestination: "true", pressed: String(pressed) } } : {})}>
              <View style={styles.placeImage}>
                {!!place.imageUrl && (
                  <Image
                    source={landmarkImage(place)}
                    contentFit="cover"
                    style={StyleSheet.absoluteFill}
                    transition={250}
                  />
                )}
                <View style={styles.placeTag}>
                  <Ionicons name="location-outline" size={13} color="#087fba" />
                  <Text style={styles.placeTagText}>Điểm đến</Text>
                </View>
              </View>
              <View style={styles.placeBody}>
                <Text numberOfLines={1} style={styles.placeTitle}>
                  {place.name}
                </Text>
                <Text numberOfLines={2} style={styles.placeDescription}>
                  {place.description}
                </Text>
                <Text style={styles.placeLink}>Khám phá chi tiết →</Text>
              </View>

        </View>
      </Pressable>
    </Link>
    <View style={{ paddingHorizontal: 8, paddingTop: 6 }}><ImageCredit place={place} /></View>
  </View>;
}
function Feature({
  icon,
  title,
  description,
}: {
  icon: "camera-outline" | "map-outline" | "people-outline";
  title: string;
  description: string;
}) {
  return (
    <View style={styles.feature}>
      <View style={styles.featureIcon}>
        <MotionIcon name={icon === "camera-outline" ? "camera" : icon === "map-outline" ? "compass" : "people"} size={26} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "transparent" },
  container: {
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 90,
  },
  hero: { flexDirection: "row", alignItems: "stretch", gap: 36 },
  heroCompact: { flexDirection: "column", gap: 28 },
  heroCopy: { flex: 1, justifyContent: "center", paddingVertical: 54 },
  heroCopyCompact: { paddingVertical: 20 },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: "#e2f3fc",
    borderRadius: 30,
  },
  eyebrowText: {
    color: "#087fba",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#103c5b",
    fontSize: 58,
    lineHeight: 65,
    fontWeight: "900",
    letterSpacing: -2.5,
    marginTop: 24,
    maxWidth: 680,
  },
  heroTitleCompact: { fontSize: 42, lineHeight: 49, letterSpacing: -1.5 },
  heroAccent: { color: "#087fba" },
  heroDescription: {
    color: "#64748b",
    fontSize: 17,
    lineHeight: 29,
    maxWidth: 560,
    marginTop: 22,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 30 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 22,
    borderRadius: 15,
    backgroundColor: "#087fba",
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  secondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#d9e5f8",
    borderRadius: 15,
    backgroundColor: "#fff",
  },
  secondaryText: { color: "#087fba", fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
  heroFootnote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 30,
  },
  footnoteIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e4efff",
    alignItems: "center",
    justifyContent: "center",
  },
  footnoteText: { color: "#728097", fontWeight: "600", fontSize: 13 },
  artwork: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minHeight: 500,
    borderRadius: 32,
    backgroundColor: "#e2f3fc",
  },
  artworkCompact: { flexGrow: 0, flexShrink: 0, flexBasis: "auto", minHeight: 0 },
  featureBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 22,
    marginTop: 30,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#eaf0fa",
    backgroundColor: "#fff",
  },
  feature: {
    flex: 1,
    flexBasis: 230,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#e2f3fc",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { color: "#1e293b", fontWeight: "800", fontSize: 14 },
  featureDescription: { color: "#54738b", marginTop: 5, fontSize: 12 },
  destinationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    marginTop: 72,
    marginBottom: 24,
  },
  sectionOverline: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: "#087fba",
  },
  sectionTitle: {
    fontSize: 31,
    fontWeight: "900",
    color: "#15243d",
    marginTop: 8,
  },
  sectionDescription: { color: "#8290a5", marginTop: 7, fontSize: 14 },
  sectionLink: { color: "#087fba", fontWeight: "700", paddingVertical: 8 },
  empty: { color: "#64748b", paddingVertical: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 18 },
  destinationSlot: {
    flexGrow: 1,
    flexBasis: 280,
    maxWidth: 420,
  },
  destinationCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: "#eaf0fa",
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  destinationPressed: { borderColor: "#36a8ce", backgroundColor: "#e8f6fd", shadowColor: "#086792", shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  destinationCompact: { maxWidth: "100%", flexBasis: 280 },
  placePressable: { flex: 1 },
  placeImage: { height: 220, backgroundColor: "#e6effb", overflow: "hidden" },
  placeTag: {
    position: "absolute",
    left: 15,
    top: 15,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.93)",
  },
  placeTagText: { color: "#087fba", fontWeight: "700", fontSize: 11 },
  placeBody: { gap: 9, padding: 20 },
  placeTitle: { color: "#14233b", fontSize: 19, fontWeight: "800" },
  placeDescription: { color: "#8190a5", fontSize: 13, lineHeight: 21 },
  placeLink: {
    color: "#087fba",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
});
