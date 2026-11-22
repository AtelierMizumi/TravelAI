import { MorphIcon } from "@/components/morph-renderer";
import { useState } from "react";
import { View } from "react-native";
import { motionIcons, type MotionIconName } from "@/services/motion-icons";

export function MotionIcon({ name, size = 24, color = "#087fba", active }: { name: MotionIconName; size?: number; color?: string; active?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const changed = active ?? (hovered || pressed);
  return <View testID={`motion-icon-${name}`} pointerEvents="auto"
    onPointerEnter={event => { if (event.nativeEvent.pointerType === "mouse") setHovered(true); }} onPointerLeave={() => setHovered(false)}
    onTouchStart={() => { setHovered(false); setPressed(true); }} onTouchEnd={() => setPressed(false)} onTouchCancel={() => setPressed(false)}>
    <MorphIcon icon={motionIcons[name][changed ? 1 : 0]} size={size} color={color} strokeWidth={1.8} reducedMotion="always" />
  </View>;
}
