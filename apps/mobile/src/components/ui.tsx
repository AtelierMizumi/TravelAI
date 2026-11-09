import { Link, type Href } from "expo-router";
import { type PropsWithChildren, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import Animated, {
  Extrapolation,
  FadeInUp,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from "react-native-reanimated";
import { useAuth } from "@/context/auth";

export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f5f8fd" },
  content: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 80,
    gap: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5edf7",
    borderRadius: 20,
    padding: 22,
    gap: 12,
    shadowColor: "#294c80",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 30, fontWeight: "800", color: "#0f172a" },
  heading: { fontSize: 21, fontWeight: "700", color: "#0f172a" },
  text: { fontSize: 16, lineHeight: 25, color: "#475569" },
  error: { color: "#b91c1c", fontSize: 15, lineHeight: 23 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155" },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#d9e4f1",
    borderRadius: 12,
    backgroundColor: "#fff",
    color: "#0f172a",
    fontSize: 16,
    minHeight: 48,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  link: {
    color: "#1d4ed8",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 8,
  },
  image: { width: "100%", height: 220, borderRadius: 12 },
});
export function Screen({
  title,
  children,
  protected: requiresAuth = false,
}: PropsWithChildren<{ title: string; protected?: boolean }>) {
  const { user, loading } = useAuth();
  const reducedMotion = useReducedMotion();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const titleMotion = useAnimatedStyle(() =>
    reducedMotion
      ? {}
      : {
          opacity: interpolate(
            scrollY.value,
            [0, 140],
            [1, 0.55],
            Extrapolation.CLAMP,
          ),
          transform: [
            {
              translateY: interpolate(
                scrollY.value,
                [0, 140],
                [0, -8],
                Extrapolation.CLAMP,
              ),
            },
          ],
        },
  );
  return (
    <Animated.ScrollView
      style={ui.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={ui.content}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <Animated.View
        entering={reducedMotion ? undefined : FadeInUp.duration(450)}
      >
        <Animated.View style={titleMotion}>
          <Text style={ui.title}>{title}</Text>
        </Animated.View>
      </Animated.View>
      {loading ? (
        <ActivityIndicator />
      ) : requiresAuth && !user ? (
        <Card>
          <Text style={ui.text}>Đăng nhập để tiếp tục.</Text>
          <Nav href="/login">Đăng nhập</Nav>
        </Card>
      ) : (
        children
      )}
    </Animated.ScrollView>
  );
}
export function Card({ children }: PropsWithChildren) {
  return <View style={ui.card}>{children}</View>;
}
export function Nav({ href, children }: PropsWithChildren<{ href: Href }>) {
  return (
    <Link href={href} style={ui.link}>
      {children}
    </Link>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#64748b"
        {...props}
        style={[ui.input, props.style]}
      />
    </View>
  );
}
export function Action({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        ui.button,
        secondary && { backgroundColor: "#475569" },
        disabled && { opacity: 0.45 },
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
      ]}
    >
      <Text style={ui.buttonText}>{title}</Text>
    </Pressable>
  );
}
export function ErrorText({ message }: { message?: string }) {
  return message ? (
    <Text accessibilityRole="alert" style={ui.error}>
      {message}
    </Text>
  ) : null;
}
export function useAction() {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run(work: () => Promise<unknown>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Thao tác thất bại.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  return { busy, error, run };
}
export function money(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} VND · SIMULATED`;
}
export function serviceTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}
