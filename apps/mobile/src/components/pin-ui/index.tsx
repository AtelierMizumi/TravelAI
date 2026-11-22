import { MotionIcon } from "@/components/motion-icon";
/** Native adapters of Pin UI's Liquid Tabs and Task Card interaction patterns.
 * Source: https://github.com/shadcn-labs/pin-ui (Rachit Thakur), MIT.
 * Reimplemented using Expo primitives; no DOM, CSS filters, or Motion dependency.
 */
import { DepthSurface } from "@/components/depth-surface";
import { HydrationSafeIonicon as Ionicons } from "@/components/hydration-safe-icon";
import { useState, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
export type PinTab = { id: string; label: string; icon?: ComponentProps<typeof Ionicons>["name"]; count?: number };
export function PinTabs({ tabs, value, onChange }: { tabs: PinTab[]; value: string; onChange: (id: string) => void }) {
  return <View style={styles.tabs}>{tabs.map(tab => <PinTabButton key={tab.id} tab={tab} selected={value === tab.id} onPress={() => onChange(tab.id)} />)}</View>;
}
function PinTabButton({ tab, selected, onPress }: { tab: PinTab; selected: boolean; onPress: () => void }) {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const motion = useSharedValue(0);
  const reduced = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ opacity: reduced ? 1 : 1 + motion.value * 0.06 }));
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onHoverIn={() => { setHovered(true); motion.set(withTiming(-1, { duration: 140 })); }} onHoverOut={() => { setHovered(false); motion.set(withTiming(0, { duration: 140 })); }} style={({ pressed }) => [styles.tab, selected && styles.selected, (focused || hovered) && styles.focused, pressed && { opacity: 0.7 }]}>
    <Animated.View style={[styles.tabContent, animated]}>{tab.icon && <Ionicons name={tab.icon} size={17} color={selected ? "#fff" : "#54738b"} />}<Text style={[styles.tabText, selected && { color: "#fff" }]}>{tab.label}</Text>{tab.count !== undefined && <Text style={[styles.count, selected && { color: "#d5f3ff" }]}>{tab.count}</Text>}</Animated.View>
  </Pressable>;
}
export function PinTaskCard({ eyebrow, title, description, icon, action, onPress }: { eyebrow: string; title: string; description: string; icon: ComponentProps<typeof Ionicons>["name"]; action: string; onPress: () => void }) {
  const [active, setActive] = useState(false);
  return <DepthSurface style={{ flexGrow: 1, flexBasis: 240 }}><Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${action}`} onPress={onPress} onFocus={() => setActive(true)} onBlur={() => setActive(false)} onPressIn={() => setActive(true)} onPressOut={() => setActive(false)} onHoverIn={() => setActive(true)} onHoverOut={() => setActive(false)} style={({ pressed }) => [styles.task, active && { borderColor: "#38a8d9", backgroundColor: "#eff9ff" }, pressed && { opacity: 0.8 }]}>
    <View style={styles.taskTop}><View style={styles.taskIcon}><MotionIcon name={icon === "camera-outline" ? "camera" : icon === "bed-outline" ? "bed" : "compass"} active={active || undefined} size={26} color="#075782" /></View><Text style={styles.eyebrow}>{eyebrow}</Text><Ionicons name="arrow-forward" size={19} color="#54738b" /></View>
    <Text style={styles.taskTitle}>{title}</Text><Text style={styles.description}>{description}</Text><Text style={styles.action}>{action} →</Text>
  </Pressable></DepthSurface>;
}
const styles = StyleSheet.create({
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 5, padding: 6, borderRadius: 20, backgroundColor: "#e4f1f9", alignSelf: "flex-start", maxWidth: "100%" },
  tab: { borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, borderWidth: 2, borderColor: "transparent", minHeight: 48 },
  selected: { backgroundColor: "#087fba", shadowColor: "#075782", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  focused: { borderColor: "#38a8d9" }, tabContent: { flexDirection: "row", alignItems: "center", gap: 8 }, tabText: { fontSize: 14, fontWeight: "700", color: "#54738b" }, count: { fontWeight: "700", color: "#54738b", fontSize: 12 },
  task: { flexGrow: 1, flexBasis: 240, padding: 24, gap: 14, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#d2e6f2", borderRadius: 24 },
  taskTop: { flexDirection: "row", alignItems: "center", gap: 10 }, taskIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: "#e2f3fc", alignItems: "center", justifyContent: "center" }, eyebrow: { flex: 1, color: "#54738b", fontSize: 10, letterSpacing: 1.5, fontWeight: "800" },
  taskTitle: { color: "#103c5b", fontSize: 21, fontWeight: "700", letterSpacing: -0.5 }, description: { color: "#54738b", fontSize: 14, lineHeight: 23 }, action: { color: "#075782", fontSize: 14, fontWeight: "800", marginTop: 4 },
});
