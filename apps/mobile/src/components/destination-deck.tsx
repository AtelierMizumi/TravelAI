import { useMemo, useState } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, useReducedMotion } from "react-native-reanimated";
import { DepthSurface } from "@/components/depth-surface";
import { ImageCredit } from "@/components/image-credit";
import { landmarkImage } from "@/services/landmark-media";
import { horizontalDrag, nextSlide } from "@/services/depth-motion";
import type { Place } from "@/services/types";

export function DestinationDeck({ places }: { places: Place[] }) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();
  const count = places.length;
  const current = index % Math.max(count, 1);
  const place = places[current];
  const change = (direction: number) => setIndex(value => nextSlide(value, direction, count));
  const gesture = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, state) => horizontalDrag(state.dx, state.dy),
    onPanResponderRelease: (_, state) => {
      if (horizontalDrag(state.dx, state.dy) && Math.abs(state.dx) > 48)
        setIndex(value => nextSlide(value, state.dx < 0 ? 1 : -1, count));
    },
  }), [count]);
  if (!place) return null;
  return <View style={s.stage}>
    <View pointerEvents="none" style={[s.sheet, s.back]} /><View pointerEvents="none" style={[s.sheet, s.middle]} />
    <DepthSurface><Animated.View {...gesture.panHandlers} style={s.card}>
      <Animated.View key={place.id} entering={reduced ? undefined : FadeIn.duration(280)} style={s.photo}>
        <Image draggable={false} pointerEvents="none" source={landmarkImage(place)} contentFit="cover" style={StyleSheet.absoluteFill} />
        <View style={s.top}><Text style={s.badge}>VIỆT NAM · NHỮNG ĐIỀU ĐÁNG KHÁM PHÁ</Text><Ionicons name="compass-outline" size={26} color="white" /></View>
      </Animated.View>
      <View style={s.caption}><Text style={s.overline}>ĐIỂM DỪNG CHÂN TIẾP THEO</Text><Text style={s.title}>{place.name}</Text>
        <Link href={{ pathname: "/destination/[id]", params: { id: place.id } }} style={s.link}>Khám phá điểm đến ↗</Link>
      </View>
    </Animated.View></DepthSurface>
    <View style={s.controls}>
      <Text style={s.hint}>Kéo ngang để khám phá</Text>
      <Text accessibilityLiveRegion="polite" style={s.counter}>{String(current + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Điểm đến trước" onPress={() => change(-1)} disabled={count < 2} style={s.arrow}><Ionicons name="arrow-back" size={20} color="#075782" /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Điểm đến tiếp theo" onPress={() => change(1)} disabled={count < 2} style={s.arrow}><Ionicons name="arrow-forward" size={20} color="#075782" /></Pressable>
    </View>
    <ImageCredit place={place} />
  </View>;
}
const s = StyleSheet.create({
  stage: { padding: 18, paddingTop: 26, paddingBottom: 8, width: "100%", maxWidth: 640, alignSelf: "center" },
  sheet: { position: "absolute", left: 28, right: 28, top: 32, height: "78%", borderRadius: 32, borderWidth: 1, borderColor: "#acdff7" },
  back: { backgroundColor: "#c4eafa",  },
  middle: { backgroundColor: "#e2f3fc",  },
  card: { borderRadius: 28, overflow: "hidden", backgroundColor: "white", borderWidth: 1, borderColor: "#d8edf8", shadowColor: "#075782", shadowOpacity: 0.18, shadowRadius: 26, shadowOffset: { width: 0, height: 18 }, elevation: 7 },
  photo: { height: 300, backgroundColor: "#a3d9ef" },
  top: { padding: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  badge: { color: "white", backgroundColor: "#075782", padding: 9, borderRadius: 20, fontSize: 9, fontWeight: "800", letterSpacing: 1, flexShrink: 1 },
  caption: { padding: 24, gap: 8 }, overline: { color: "#087fba", fontSize: 10, letterSpacing: 2, fontWeight: "800" },
  title: { color: "#103c5b", fontSize: 29, fontWeight: "800", letterSpacing: -1 },
  link: { color: "#075782", fontWeight: "700", fontSize: 14, paddingVertical: 6 },
  controls: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 24, marginBottom: 10 },
  hint: { flex: 1, color: "#54738b", fontSize: 11 }, counter: { color: "#075782", fontSize: 11, marginRight: 4 },
  arrow: { width: 42, height: 42, borderRadius: 21, backgroundColor: "white", borderWidth: 1, borderColor: "#c8e4f3", alignItems: "center", justifyContent: "center" },
});
