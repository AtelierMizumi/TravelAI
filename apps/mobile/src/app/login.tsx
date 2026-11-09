import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useReducedMotion,
} from "react-native-reanimated";
import { Action, ErrorText, Field } from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useHydrated } from "@/hooks/use-hydrated";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Place } from "@/services/types";

type Mode = "login" | "register" | "forgot" | "verify" | "reset";
export default function Login() {
  const auth = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const running = useRef(false);
  const { width } = useWindowDimensions();
  const compact = !useHydrated() || width < 900;
  const reduced = useReducedMotion();
  const places = useResource<Place[]>("/places");
  const cover = places.data?.find((place) => !!place.imageUrl);
  const heading =
    mode === "login"
      ? "Chào mừng quay trở lại"
      : mode === "register"
        ? "Bắt đầu hành trình mới"
        : mode === "forgot"
          ? "Quên mật khẩu?"
          : mode === "verify"
            ? "Kiểm tra email của bạn"
            : "Tạo mật khẩu mới";
  const description =
    mode === "login"
      ? "Đăng nhập để tiếp tục những chuyến đi của bạn."
      : mode === "register"
        ? "Tạo tài khoản để khám phá và lưu những trải nghiệm đáng nhớ."
        : mode === "forgot"
          ? "Nhập email đã đăng ký. Chúng tôi sẽ gửi mã xác nhận nếu tài khoản tồn tại."
          : mode === "verify"
            ? "Nhập mã gồm 6 chữ số được gửi đến email đã đăng ký."
            : "Mã đã được xác nhận. Hãy nhập mật khẩu mới cho tài khoản của bạn.";
  function changeMode(next: Mode) {
    setMode(next);
    setError("");
    setNotice("");
    setPassword("");
    setConfirmation("");
    setCode("");
    setTicket("");
  }
  async function run(work: () => Promise<void>) {
    if (running.current) return;
    running.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Không thể hoàn tất yêu cầu.",
      );
    } finally {
      running.current = false;
      setBusy(false);
    }
  }
  return (
    <ScrollView
      style={styles.page}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.outer}
    >
      <View style={[styles.layout, compact && styles.layoutCompact]}>
        <Animated.View
          entering={reduced ? undefined : FadeInUp.duration(550)}
          style={styles.formSide}
        >
          <View style={styles.form}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Ionicons name="compass" color="#fff" size={22} />
              </View>
              <Text style={styles.brandName}>
                Travel<Text style={styles.accent}>AI</Text>
              </Text>
            </View>
            <Text style={styles.kicker}>CÙNG BẠN KHÁM PHÁ</Text>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.description}>{description}</Text>
            <View style={styles.fields}>
              {mode === "register" && (
                <Field
                  label="Họ và tên"
                  placeholder="Tên của bạn"
                  value={name}
                  onChangeText={setName}
                  autoComplete="name"
                />
              )}
              {mode === "verify" || mode === "reset" ? (
                <Text style={styles.muted}>Email: {email.trim()}</Text>
              ) : (
                <Field
                  label="Địa chỉ email"
                  placeholder="ban@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              )}
              {mode === "verify" && (
                <Field
                  label="Mã xác nhận"
                  placeholder="6 chữ số"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
              )}
              {(mode === "login" ||
                mode === "register" ||
                mode === "reset") && (
                <Field
                  label={mode === "reset" ? "Mật khẩu mới" : "Mật khẩu"}
                  placeholder={
                    mode === "login" ? "Nhập mật khẩu" : "Ít nhất 8 ký tự"
                  }
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              )}
              {mode === "reset" && (
                <Field
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmation}
                  onChangeText={setConfirmation}
                  secureTextEntry
                  autoComplete="new-password"
                />
              )}
              {mode === "login" && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => changeMode("forgot")}
                  style={styles.forgot}
                >
                  <Text style={styles.link}>Quên mật khẩu?</Text>
                </Pressable>
              )}
              <ErrorText message={error} />
              {!!notice && (
                <Text accessibilityRole="status" style={styles.notice}>
                  {notice}
                </Text>
              )}
              {mode === "login" || mode === "register" ? (
                <Action
                  title={
                    busy
                      ? "Đang xử lý…"
                      : mode === "login"
                        ? "Đăng nhập"
                        : "Tạo tài khoản"
                  }
                  disabled={
                    busy ||
                    !email.trim() ||
                    !password ||
                    (mode === "register" && !name.trim())
                  }
                  onPress={() =>
                    void run(async () => {
                      await auth.signIn(
                        email.trim(),
                        password,
                        mode === "register" ? name.trim() : undefined,
                      );
                      setPassword("");
                      router.replace("/profile");
                    })
                  }
                />
              ) : mode === "forgot" ? (
                <Action
                  title={busy ? "Đang gửi…" : "Gửi mã xác nhận"}
                  disabled={busy || !email.trim()}
                  onPress={() =>
                    void run(async () => {
                      const result = await api<{ message: string }>(
                        "/auth/password-reset/request",
                        { method: "POST", body: { email: email.trim() } },
                      );
                      setMode("verify");
                      setNotice(result.message);
                    })
                  }
                />
              ) : mode === "verify" ? (
                <Action
                  title={busy ? "Đang xác nhận…" : "Xác nhận mã"}
                  disabled={busy || !/^[0-9]{6}$/.test(code)}
                  onPress={() =>
                    void run(async () => {
                      const result = await api<{ ticket: string }>(
                        "/auth/password-reset/verify",
                        { method: "POST", body: { email: email.trim(), code } },
                      );
                      setTicket(result.ticket);
                      setCode("");
                      setNotice("");
                      setMode("reset");
                    })
                  }
                />
              ) : (
                <Action
                  title={busy ? "Đang xác nhận…" : "Đặt lại mật khẩu"}
                  disabled={
                    busy ||
                    !ticket ||
                    password.length < 8 ||
                    password !== confirmation
                  }
                  onPress={() =>
                    void run(async () => {
                      const result = await api<{ message: string }>(
                        "/auth/password-reset/confirm",
                        {
                          method: "POST",
                          body: {
                            email: email.trim(),
                            ticket,
                            newPassword: password,
                            confirmPassword: confirmation,
                          },
                        },
                      );
                      changeMode("login");
                      setNotice(result.message);
                    })
                  }
                />
              )}
              {busy && <ActivityIndicator color="#2563eb" />}
            </View>
            <View style={styles.switchRow}>
              {mode === "login" ? (
                <>
                  <Text style={styles.muted}>Chưa có tài khoản? </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Đăng ký tài khoản"
                    onPress={() => changeMode("register")}
                  >
                    <Text style={styles.link}>Đăng ký ngay</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.muted}>
                    {mode === "register" ? "Đã có tài khoản? " : ""}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => changeMode("login")}
                  >
                    <Text style={styles.link}>Quay lại đăng nhập</Text>
                  </Pressable>
                </>
              )}
            </View>
            {(mode === "verify" || mode === "reset") && (
              <Pressable
                accessibilityRole="button"
                onPress={() => changeMode("forgot")}
              >
                <Text style={styles.link}>Gửi lại mã</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
        {!compact && (
          <Animated.View
            entering={reduced ? undefined : FadeInDown.delay(100).duration(650)}
            style={styles.art}
          >
            <LinearGradient
              colors={["#93c5fd", "#164e9a", "#0f294f"]}
              style={StyleSheet.absoluteFill}
            />
            {!!cover?.imageUrl && (
              <Image
                source={{ uri: cover.imageUrl }}
                contentFit="cover"
                style={StyleSheet.absoluteFill}
              />
            )}
            <LinearGradient
              colors={["transparent", "rgba(7,28,62,0.84)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.artText}>
              <View style={styles.artBadge}>
                <Ionicons name="sparkles" size={17} color="#fff" />
                <Text style={styles.artBadgeText}>KHÁM PHÁ CÙNG TRAVELAI</Text>
              </View>
              <Text style={styles.artTitle}>
                Hành trình của bạn bắt đầu từ đây.
              </Text>
              <Text style={styles.artSubtitle}>
                Tìm cảm hứng, lưu kỷ niệm và khám phá những điểm đến mới.
              </Text>
              {!!cover?.name && (
                <Text style={styles.artLocation}>⌖ {cover.name}</Text>
              )}
            </View>
          </Animated.View>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#fff" },
  outer: { flexGrow: 1 },
  layout: {
    flex: 1,
    flexDirection: "row",
    maxWidth: 1600,
    width: "100%",
    alignSelf: "center",
  },
  layoutCompact: { flexDirection: "column" },
  formSide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 50,
  },
  form: { width: "100%", maxWidth: 450, alignSelf: "center", gap: 12 },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 30,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { fontSize: 24, fontWeight: "900", color: "#172744" },
  accent: { color: "#2563eb" },
  kicker: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 36,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.2,
    color: "#10233f",
  },
  description: { fontSize: 15, lineHeight: 24, color: "#718096" },
  fields: { gap: 16, marginTop: 18 },
  forgot: { alignSelf: "flex-end" },
  link: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "800",
    paddingVertical: 6,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  muted: { color: "#64748b", fontSize: 14 },
  notice: { color: "#15803d", fontSize: 14, lineHeight: 22 },
  art: {
    flex: 1,
    margin: 20,
    minHeight: 600,
    borderRadius: 36,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  artText: { padding: 48, gap: 15 },
  artBadge: { flexDirection: "row", gap: 8, alignItems: "center" },
  artBadgeText: {
    color: "#dbeafe",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  artTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 42,
    lineHeight: 50,
    letterSpacing: -1,
  },
  artSubtitle: {
    color: "#e5edf8",
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 430,
  },
  artLocation: { color: "#fff", fontWeight: "700", fontSize: 14, marginTop: 8 },
});
