import { useHydrated } from "@/hooks/use-hydrated";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { Footer } from "@/components/footer";
import { ErrorText } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import type { CatalogItem, Offer, Place } from "@/services/types";

export default function Home() {
  const places = useResource<Place[]>("/places");
  const offers = useResource<Offer[]>("/booking/offers");
  const tours = useResource<CatalogItem[]>("/tours");
  const hotels = useResource<CatalogItem[]>("/hotels");
  const { width, height } = useWindowDimensions();
  const compact = !useHydrated() || width < 760;
  const reducedMotion = useReducedMotion();
  const scrollY = useSharedValue(0);
  const gridY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const artworkMotion = useAnimatedStyle(() =>
    reducedMotion
      ? {}
      : {
          transform: [
            {
              translateY: interpolate(
                scrollY.value,
                [0, 450],
                [0, 35],
                Extrapolation.CLAMP,
              ),
            },
          ],
        },
  );
  const cover = places.data?.find((place) => !!place.imageUrl);
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
    <Animated.ScrollView
      style={styles.page}
      contentContainerStyle={styles.container}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <View style={[styles.hero, compact && styles.heroCompact]}>
        <Animated.View
          entering={reducedMotion ? undefined : FadeInUp.duration(650)}
          style={[styles.heroCopy, compact && styles.heroCopyCompact]}
        >
          <View style={styles.eyebrow}>
            <Ionicons name="sparkles" size={15} color="#2563eb" />
            <Text style={styles.eyebrowText}>KHÁM PHÁ VIỆT NAM CÙNG AI</Text>
          </View>
          <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>
            Mỗi bức ảnh,{" "}
            <Text style={styles.heroAccent}>một hành trình mới.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Nhận diện địa danh từ hình ảnh, tìm tour và khách sạn, rồi lưu lại
            những trải nghiệm đáng nhớ cùng TravelAI.
          </Text>
          <View style={styles.actions}>
            <Link href="/detection" asChild>
              <Pressable style={styles.primary}>
                <Ionicons name="camera-outline" color="#fff" size={20} />
                <Text style={styles.primaryText}>Thử nhận diện ảnh</Text>
                <Ionicons name="arrow-forward" color="#fff" size={18} />
              </Pressable>
            </Link>
            <Link href="/booking/tours" asChild>
              <Pressable style={styles.secondary}>
                <Text style={styles.secondaryText}>Khám phá tour</Text>
                <Ionicons name="arrow-forward" color="#2563eb" size={17} />
              </Pressable>
            </Link>
          </View>
          <View style={styles.heroFootnote}>
            <View style={styles.footnoteIcon}>
              <Ionicons name="flash" size={15} color="#2563eb" />
            </View>
            <Text style={styles.footnoteText}>
              Một nơi cho cảm hứng và kế hoạch của bạn
            </Text>
          </View>
        </Animated.View>
        <Animated.View
          entering={
            reducedMotion ? undefined : FadeInDown.delay(180).duration(750)
          }
          style={[styles.artwork, compact && styles.artworkCompact]}
        >
          <Animated.View style={[styles.artworkContent, artworkMotion]}>
            <LinearGradient
              colors={["#bed9ff", "#dceaff", "#f4f8ff"]}
              style={StyleSheet.absoluteFill}
            />
            {cover?.imageUrl ? (
              <Image
                source={{ uri: cover.imageUrl }}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
                transition={350}
              />
            ) : (
              <View style={styles.abstractScene}>
                <View style={styles.sun} />
                <View style={styles.mountainBack} />
                <View style={styles.mountainFront} />
                <View style={styles.water} />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(8,32,71,0.64)"]}
              style={styles.coverGradient}
            />
            <View style={styles.artworkLabel}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.labelOverline}>BẮT ĐẦU KHÁM PHÁ</Text>
                <Text style={styles.labelTitle}>
                  {cover?.name || "Việt Nam trong tầm tay"}
                </Text>
              </View>
            </View>
            <View style={styles.floatingCard}>
              <Ionicons name="sparkles" size={18} color="#2563eb" />
              <Text style={styles.floatingText}>Khám phá qua hình ảnh</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
      <Animated.View
        entering={reducedMotion ? undefined : FadeInUp.delay(250).duration(650)}
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
      </Animated.View>
      {featured.length > 0 && (
        <>
          <View style={styles.destinationHeader}>
            <View>
              <Text style={styles.sectionOverline}>ƯU ĐÃI THEO LỊCH</Text>
              <Text style={styles.sectionTitle}>Chuyến đi đang chờ bạn</Text>
              <Text style={styles.sectionDescription}>
                Giảm giá áp dụng cho ngày sử dụng được ghi trên từng ưu đãi.
              </Text>
            </View>
          </View>
          <View style={styles.grid}>
            {featured.map(({ offer, item, sale }) => (
              <View key={offer.id} style={styles.destinationCard}>
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
      <View style={styles.destinationHeader}>
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
      <ErrorText message={places.error} />
      {places.loading && !places.data && (
        <Text style={styles.empty}>Đang tải điểm đến…</Text>
      )}
      {places.data?.length === 0 && (
        <Text style={styles.empty}>Chưa có điểm đến được công bố.</Text>
      )}
      <View
        style={styles.grid}
        onLayout={(event) => {
          gridY.value = event.nativeEvent.layout.y;
        }}
      >
        {places.data?.map((place, index) => (
          <PlaceCard
            key={place.id}
            place={place}
            index={index}
            compact={compact}
            reducedMotion={reducedMotion}
            scrollY={scrollY}
            gridY={gridY}
            viewportHeight={height}
          />
        ))}
      </View>
      <Footer />
    </Animated.ScrollView>
  );
}
function PlaceCard({
  place,
  index,
  compact,
  reducedMotion,
  scrollY,
  gridY,
  viewportHeight,
}: {
  place: Place;
  index: number;
  compact: boolean;
  reducedMotion: boolean;
  scrollY: SharedValue<number>;
  gridY: SharedValue<number>;
  viewportHeight: number;
}) {
  const itemY = useSharedValue(0);
  const hovered = useSharedValue(0);
  const motion = useAnimatedStyle(() => {
    const reveal = reducedMotion
      ? 1
      : interpolate(
          scrollY.value + viewportHeight - gridY.value - itemY.value,
          [40, 230],
          [0, 1],
          Extrapolation.CLAMP,
        );
    return {
      opacity: 0.35 + reveal * 0.65,
      transform: [
        { translateY: (1 - reveal) * 24 - hovered.value * 7 },
        { scale: 1 + hovered.value * 0.025 },
      ],
      shadowOpacity: 0.05 + hovered.value * 0.22,
      shadowRadius: 16,
      shadowColor: "#244c83",
      shadowOffset: { width: 0, height: 6 },
    };
  });
  const hover = (active: boolean) => {
    hovered.value = reducedMotion
      ? active
        ? 1
        : 0
      : withTiming(active ? 1 : 0, { duration: 220 });
  };
  return (
    <Animated.View
      entering={
        reducedMotion
          ? undefined
          : FadeInUp.delay(Math.min(index, 5) * 80).duration(500)
      }
      onLayout={(event) => {
        itemY.value = event.nativeEvent.layout.y;
      }}
      style={[styles.destinationSlot, compact && styles.destinationCompact]}
    >
      <Animated.View style={[styles.destinationCard, motion]}>
        <Link
          href={{ pathname: "/destination/[id]", params: { id: place.id } }}
          asChild
        >
          <Pressable
            style={styles.placePressable}
            onHoverIn={() => hover(true)}
            onHoverOut={() => hover(false)}
            onFocus={() => hover(true)}
            onBlur={() => hover(false)}
          >
            <View style={styles.placeImage}>
              {!!place.imageUrl && (
                <Image
                  source={{ uri: place.imageUrl }}
                  contentFit="cover"
                  style={StyleSheet.absoluteFill}
                  transition={250}
                />
              )}
              <View style={styles.placeTag}>
                <Ionicons name="location-outline" size={13} color="#2563eb" />
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
          </Pressable>
        </Link>
      </Animated.View>
    </Animated.View>
  );
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
        <Ionicons name={icon} size={23} color="#2563eb" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8faff" },
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
    backgroundColor: "#eaf2ff",
    borderRadius: 30,
  },
  eyebrowText: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heroTitle: {
    color: "#122341",
    fontSize: 58,
    lineHeight: 65,
    fontWeight: "900",
    letterSpacing: -2.5,
    marginTop: 24,
    maxWidth: 680,
  },
  heroTitleCompact: { fontSize: 42, lineHeight: 49, letterSpacing: -1.5 },
  heroAccent: { color: "#2563eb" },
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
    backgroundColor: "#2563eb",
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
  secondaryText: { color: "#2563eb", fontSize: 15, fontWeight: "700" },
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
    flex: 1,
    minHeight: 500,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "#dceaff",
  },
  artworkCompact: { flex: 0, minHeight: 340 },
  artworkContent: { flex: 1 },
  abstractScene: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: "hidden",
  },
  sun: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fff4d3",
    top: "12%",
    right: "20%",
  },
  mountainBack: {
    position: "absolute",
    width: "120%",
    height: "85%",
    backgroundColor: "#96c5dd",
    transform: [{ rotate: "-22deg" }],
    top: "46%",
    left: "-48%",
    borderRadius: 70,
  },
  mountainFront: {
    position: "absolute",
    width: "120%",
    height: "85%",
    backgroundColor: "#6ca7ba",
    transform: [{ rotate: "23deg" }],
    top: "50%",
    right: "-48%",
    borderRadius: 70,
  },
  water: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "22%",
    backgroundColor: "#72b5c4",
  },
  coverGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "45%",
  },
  artworkLabel: {
    position: "absolute",
    bottom: 25,
    left: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  labelOverline: {
    color: "#e2e8f0",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  labelTitle: { color: "#fff", fontSize: 17, fontWeight: "800", marginTop: 3 },
  floatingCard: {
    position: "absolute",
    top: 22,
    right: 22,
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  floatingText: { color: "#334155", fontSize: 12, fontWeight: "700" },
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
    backgroundColor: "#eff5ff",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: { color: "#1e293b", fontWeight: "800", fontSize: 14 },
  featureDescription: { color: "#94a3b8", marginTop: 5, fontSize: 12 },
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
    color: "#2563eb",
  },
  sectionTitle: {
    fontSize: 31,
    fontWeight: "900",
    color: "#15243d",
    marginTop: 8,
  },
  sectionDescription: { color: "#8290a5", marginTop: 7, fontSize: 14 },
  sectionLink: { color: "#2563eb", fontWeight: "700", paddingVertical: 8 },
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
  placeTagText: { color: "#2563eb", fontWeight: "700", fontSize: 11 },
  placeBody: { gap: 9, padding: 20 },
  placeTitle: { color: "#14233b", fontSize: 19, fontWeight: "800" },
  placeDescription: { color: "#8190a5", fontSize: 13, lineHeight: 21 },
  placeLink: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 3,
  },
});
