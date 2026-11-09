import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);
export function PaymentResult({
  success,
  message,
}: {
  success: boolean;
  message?: string;
}) {
  const progress = useSharedValue(0);
  const mark = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    progress.value = reduced ? 1 : withTiming(1, { duration: 650 });
    mark.value = reduced ? 1 : withDelay(600, withTiming(1, { duration: 650 }));
  }, [progress, mark, reduced]);
  const circle = useAnimatedProps(() => ({
    strokeDashoffset: 289 * (1 - progress.value),
  }));
  const symbol = useAnimatedProps(() => ({
    strokeDashoffset: (success ? 70 : 100) * (1 - mark.value),
  }));
  const color = success ? "#16a34a" : "#dc2626";
  return (
    <View accessibilityRole="alert" style={styles.wrap}>
      <Svg width={116} height={116} viewBox="0 0 116 116">
        <AnimatedCircle
          cx={58}
          cy={58}
          r={46}
          stroke={color}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="289 289"
          animatedProps={circle}
          transform="rotate(-90 58 58)"
        />
        <AnimatedPath
          d={
            success
              ? "M 34 59 L 50 74 L 82 41"
              : "M 41 41 L 75 75 M 75 41 L 41 75"
          }
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={success ? "70 70" : "100 100"}
          animatedProps={symbol}
        />
      </Svg>
      <Text style={[styles.title, { color }]}>
        {success ? "Bạn đã thanh toán thành công" : "Thanh toán thất bại"}
      </Text>
      <Text style={styles.body}>
        {success
          ? "Xin cảm ơn! Giao dịch SIMULATED đã được ghi nhận."
          : message || "Giao dịch SIMULATED không thành công."}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 12, paddingVertical: 20 },
  title: { fontSize: 23, fontWeight: "800", textAlign: "center" },
  body: { fontSize: 15, lineHeight: 22, color: "#64748b", textAlign: "center" },
});
