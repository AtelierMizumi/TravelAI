import { HydrationSafeIonicon } from "@/components/hydration-safe-icon";
import { MotionScroll } from "@/components/motion-scroll";
import { MotionEntry } from "@/components/motion-entry";
import { DepthSurface } from "@/components/depth-surface";
import { Link, type Href } from "expo-router";
import { type ComponentRef, type PropsWithChildren, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type TextInputProps,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "@/context/auth";

export const ui = StyleSheet.create({
  page: { flex: 1, backgroundColor: "transparent" },
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
    borderColor: "#e5ebf5",
    borderRadius: 22,
    padding: 22,
    gap: 12,
    shadowColor: "#294c80",
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  title: { fontSize: 30, fontWeight: "800", letterSpacing: -0.7, color: "#103c5b" },
  heading: { fontSize: 21, fontWeight: "700", color: "#103c5b" },
  text: { fontSize: 16, lineHeight: 25, color: "#475569" },
  error: { color: "#b91c1c", fontSize: 15, lineHeight: 23 },
  label: { fontSize: 14, fontWeight: "600", color: "#334155" },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#d9e4f1",
    borderRadius: 12,
    backgroundColor: "#fff",
    color: "#103c5b",
    fontSize: 16,
    minHeight: 48,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: "#087fba",
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  link: {
    color: "#075782",
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
  const { width } = useWindowDimensions();
  return (
    <MotionEntry kind="page"><MotionScroll
      style={ui.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[ui.content, width < 600 && { paddingHorizontal: 16, paddingTop: 18 }]}
    >
      <Text style={ui.title}>{title}</Text>
      {loading ? (
        <ActivityIndicator />
      ) : requiresAuth && !user ? (
        <Card>
          <Text style={ui.text}>Đăng nhập để tiếp tục.</Text>
          <Nav href="/login">Đăng nhập</Nav>
        </Card>
      ) : (
        <View style={{ gap: 20 }}>
          {children}
        </View>
      )}
    </MotionScroll></MotionEntry>
  );
}
export function Card({ children, section, hoverSurface = false }: PropsWithChildren<{ section?: string; hoverSurface?: boolean }>) {
  const surface = <DepthSurface style={ui.card} hoverSurface={hoverSurface}>{children}</DepthSurface>;
  return section ? <MotionEntry section={section}>{surface}</MotionEntry> : surface;
}
export function Nav({ href, children }: PropsWithChildren<{ href: Href }>) {
  const [active, setActive] = useState(false);
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" onHoverIn={() => setActive(true)} onHoverOut={() => setActive(false)} onFocus={() => setActive(true)} onBlur={() => setActive(false)}>
        <Text style={[ui.link, active && { color: "#064c75", textDecorationLine: "underline" }]}>{children}</Text>
      </Pressable>
    </Link>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text style={ui.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#64748b"
        {...props}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
        style={[ui.input, focused && { borderColor: "#38a8d9", backgroundColor: "#fbfdff" }, props.style]}
      />
    </View>
  );
}
/** Search-only presentation; callers retain their existing query and filtering logic. */
export function SearchBar({ label, loading = false, ...props }: TextInputProps & { label: string; loading?: boolean }) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const reducedMotion = useReducedMotion();
  const focus = useSharedValue(0);
  const ring = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], ["#d9e4f1", "#168bbd"]),
    backgroundColor: interpolateColor(focus.value, [0, 1], ["#ffffff", "#f0faff"]),
  }));
  return <View style={{ gap: 6 }}>
    <Text style={ui.label}>{label}</Text>
    <Animated.View style={[{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingHorizontal: 8, minHeight: 50 }, ring]}>
      <View style={{ width: 32, alignItems: "center" }}>
        {loading ? <ActivityIndicator size="small" color="#087fba" accessibilityLabel="Đang tìm kiếm" /> : <HydrationSafeIonicon name="search-outline" size={21} color="#087fba" />}
      </View>
      <TextInput {...props} ref={input} accessibilityLabel={label} placeholderTextColor="#64748b"
        onFocus={event => { focus.set(withTiming(1, { duration: reducedMotion ? 0 : 150 })); props.onFocus?.(event); }}
        onBlur={event => { focus.set(withTiming(0, { duration: reducedMotion ? 0 : 150 })); props.onBlur?.(event); }}
        style={[ui.input, { flex: 1, minWidth: 0, borderWidth: 0, backgroundColor: "transparent", paddingHorizontal: 8 }, props.style]} />
      <Pressable accessibilityRole="button" accessibilityLabel={`Xóa tìm kiếm: ${label}`} disabled={!props.value || props.editable === false}
        onPress={() => { props.onChangeText?.(""); input.current?.focus(); }}
        style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", opacity: props.value ? (pressed ? 0.55 : 1) : 0, backgroundColor: pressed ? "#d8eef9" : "transparent" })}>
        <HydrationSafeIonicon name="close-circle-outline" size={21} color="#246786" />
      </Pressable>
    </Animated.View>
  </View>;
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
  const reducedMotion = useReducedMotion();
  const interaction = useSharedValue(0);
  const motion = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 1 : 1 - 0.06 * interaction.value,
  }));
  const highlight = (active: boolean) => {
    interaction.value = reducedMotion ? 0 : withTiming(active ? 1 : 0, { duration: 160 });
  };
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => highlight(true)}
      onHoverOut={() => highlight(false)}
      onFocus={() => highlight(true)}
      onBlur={() => highlight(false)}
      onPressIn={() => highlight(false)}
      onPressOut={() => highlight(false)}
      style={({ pressed }) => [disabled && { opacity: 0.45 }, pressed && !disabled && { opacity: 0.82 }]}
    >
      <Animated.View style={[ui.button, secondary && { backgroundColor: "#e2f3fc", borderWidth: 1, borderColor: "#c8e4f3" }, motion]}>
        <Text style={[ui.buttonText, secondary && { color: "#075782" }]}>{title}</Text>
      </Animated.View>
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
