import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LiveScan } from "@/components/live-scan";
import { recognizeImage, type RecognitionResult } from "@/services/recognition";

export default function RecognitionScreen() {
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [showLiveScan, setShowLiveScan] = useState(false);
  const reducedMotion = useReducedMotion();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const headingMotion = useAnimatedStyle(() =>
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
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);

  async function chooseImage(camera: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted)
          throw new Error(
            "Cần quyền camera để chụp ảnh. Bạn có thể chọn ảnh từ thư viện.",
          );
      }
      const selection = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.85,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.85,
          });
      if (selection.canceled) return;
      const asset = selection.assets[0];
      // Normalize HEIC and other phone formats to the server's supported JPEG format.
      const context = ImageManipulator.manipulate(asset.uri);
      if (Math.max(asset.width, asset.height) > 1600) {
        context.resize(
          asset.width >= asset.height
            ? { width: 1600, height: null }
            : { width: null, height: 1600 },
        );
      }
      const rendered = await context.renderAsync();
      const prepared = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
      });
      setUri(prepared.uri);
      setConsent(false);
      setResult(null);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Không mở được ảnh.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function recognize() {
    if (!uri || !consent || busy) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    const timeout = setTimeout(() => controller.abort(), 90_000);
    try {
      const response = await recognizeImage(uri, controller.signal);
      if (!controller.signal.aborted) setResult(response);
    } catch (failure) {
      if (pending.current === controller) {
        setError(
          controller.signal.aborted
            ? "Yêu cầu đã dừng hoặc quá thời gian. Bạn có thể thử lại."
            : failure instanceof Error
              ? failure.message
              : "Không kết nối được AI Service.",
        );
      }
    } finally {
      clearTimeout(timeout);
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  function changeConsent(value: boolean) {
    setConsent(value);
    if (!value) pending.current?.abort();
  }

  return (
    <Animated.ScrollView
      style={styles.screen}
      onScroll={onScroll}
      scrollEventThrottle={16}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
      ]}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={28} color="#2563eb" />
        </View>
        <Animated.View
          entering={reducedMotion ? undefined : FadeInUp.duration(450)}
        >
          <Animated.Text style={[styles.heading, headingMotion]}>
            Khám phá qua hình ảnh
          </Animated.Text>
        </Animated.View>
        <Text style={styles.body}>
          Một bức ảnh có thể mở ra cả hành trình. Chọn ảnh hoặc chụp một địa
          điểm để TravelAI giúp bạn khám phá.
        </Text>
      </View>
      <View style={styles.upload}>
        <Ionicons name="images-outline" size={36} color="#2563eb" />
        <Text style={styles.title}>Bắt đầu với một bức ảnh</Text>
        <Text style={styles.helper}>
          Ảnh địa danh, thiên nhiên, món ăn hoặc vật phẩm văn hóa
        </Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={styles.primary}
            disabled={busy}
            onPress={() => chooseImage(false)}
          >
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.primaryText}>Chọn ảnh từ thiết bị</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.secondary}
            disabled={busy}
            onPress={() => chooseImage(true)}
          >
            <Ionicons name="camera-outline" size={20} color="#2563eb" />
            <Text style={styles.secondaryText}>Chụp ảnh</Text>
          </Pressable>
        </View>
      </View>
      {uri && (
        <Image
          source={{ uri }}
          contentFit="contain"
          style={styles.preview}
          accessibilityLabel="Ảnh đã chọn để nhận diện"
        />
      )}
      {uri && (
        <View style={styles.permission}>
          <Switch
            value={consent}
            onValueChange={changeConsent}
            accessibilityLabel="Đồng ý gửi ảnh đến Google Cloud Vision"
          />
          <Text style={styles.permissionText}>
            Tôi đồng ý gửi ảnh này đến Google Cloud Vision để nhận diện và xác
            nhận ảnh không chứa dữ liệu cá nhân hoặc riêng tư.
          </Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        style={[
          styles.primary,
          (!uri || !consent || busy) && { opacity: 0.45 },
        ]}
        disabled={!uri || !consent || busy}
        onPress={recognize}
      >
        <Ionicons name="sparkles-outline" size={20} color="#fff" />
        <Text style={styles.primaryText}>Phân tích hình ảnh</Text>
      </Pressable>
      {busy && <ActivityIndicator accessibilityLabel="Đang xử lý ảnh" />}
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      {result && (
        <View style={styles.result}>
          <Text style={styles.status}>
            {result.recognitionStatus === "identified"
              ? "Đã nhận diện"
              : result.recognitionStatus === "predicted"
                ? "AI dự đoán"
                : "Chưa xác định"}
          </Text>
          <Text style={styles.title}>
            {result.displayName ||
              result.name ||
              "Chưa xác định được đối tượng"}
          </Text>
          <Text style={styles.body}>{result.description}</Text>
          {!!result.reason && <Text style={styles.body}>{result.reason}</Text>}
          {!!result.labels?.length && (
            <Text style={styles.body}>{result.labels.join(", ")}</Text>
          )}
          {!!result.objects?.length && (
            <Text style={styles.body}>
              Đối tượng quan sát {result.objects.join(", ")}
            </Text>
          )}
          {!!result.ocrText && (
            <Text selectable style={styles.body}>
              Văn bản trong ảnh {result.ocrText}
            </Text>
          )}
          {result.coordinates && (
            <Text selectable style={styles.body}>
              Vị trí {result.coordinates.latitude},{" "}
              {result.coordinates.longitude}
            </Text>
          )}
          {result.knowledgeUrl?.startsWith("https://") && (
            <Pressable
              accessibilityRole="link"
              style={styles.secondary}
              onPress={() => {
                void Linking.openURL(result.knowledgeUrl!).catch(() =>
                  setError("Không mở được liên kết tham khảo."),
                );
              }}
            >
              <Text style={styles.secondaryText}>
                Đọc nguồn {result.knowledgeSource || "tham khảo"} →
              </Text>
            </Pressable>
          )}
          <Text style={styles.body}>Nguồn xử lý {result.engine}</Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        style={styles.secondary}
        onPress={() => setShowLiveScan(!showLiveScan)}
      >
        <Ionicons name="scan-outline" size={20} color="#2563eb" />
        <Text style={styles.secondaryText}>
          {showLiveScan ? "Đóng quét camera" : "Quét camera trực tiếp"}
        </Text>
      </Pressable>
      {showLiveScan && <LiveScan />}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 12, paddingVertical: 12 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#e6efff",
    alignItems: "center",
    justifyContent: "center",
  },
  upload: {
    alignItems: "center",
    gap: 12,
    padding: 32,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#a9c5f7",
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  helper: { color: "#94a3b8", textAlign: "center", lineHeight: 21 },
  primary: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#2563eb",
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  secondary: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#eff5ff",
  },
  secondaryText: { color: "#2563eb", fontWeight: "700", fontSize: 15 },
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  content: {
    paddingHorizontal: 24,
    gap: 20,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  heading: { fontSize: 28, fontWeight: "700", color: "#0f172a" },
  title: { fontSize: 22, fontWeight: "600", color: "#0f172a" },
  body: { fontSize: 16, lineHeight: 25, color: "#475569" },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  preview: {
    width: "100%",
    height: 280,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  permission: { flexDirection: "row", alignItems: "center", gap: 12 },
  permissionText: { flex: 1, color: "#475569", lineHeight: 23 },
  result: { padding: 20, backgroundColor: "#fff", borderRadius: 16, gap: 12 },
  status: { color: "#1d4ed8", fontWeight: "600" },
  error: { color: "#b91c1c", lineHeight: 24 },
});
