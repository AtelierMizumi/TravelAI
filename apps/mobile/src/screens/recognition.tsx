import { MotionEntry } from "@/components/motion-entry";
import { MotionScroll } from "@/components/motion-scroll";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { api } from "@/services/api";
import type { Place } from "@/services/types";
import * as Linking from "expo-linking";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  Text,
  View,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CapturePhoto } from "@/components/capture-photo";
import { LiveScan } from "@/components/live-scan";
import { recognizeImage, type RecognitionResult } from "@/services/recognition";
import { searchPlaces } from "@/services/place-search";
import { suggestedPlaceQuery } from "@/services/suggestion";
import { prepareWebImage } from "@/services/webImage";

async function prepareNativeImage(asset: { uri: string; width: number; height: number }): Promise<string> {
  const context = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > 1600) {
    context.resize(asset.width >= asset.height ? { width: 1600 } : { height: 1600 });
  }
  const rendered = await context.renderAsync();
  const prepared = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
  return prepared.uri;
}

export default function RecognitionScreen() {
  const insets = useSafeAreaInsets();
  const [uri, setUri] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [matchedPlace, setMatchedPlace] = useState<Place | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [placeQuery, setPlaceQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [placeError, setPlaceError] = useState("");
  const [placesBusy, setPlacesBusy] = useState(false);
  const [showLiveScan, setShowLiveScan] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => () => pending.current?.abort(), []);
  useFocusEffect(useCallback(() => () => {
    pending.current?.abort();
    setShowCamera(false);
    setShowLiveScan(false);
  }, []));

  async function chooseImage() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const selection = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.85 });
      if (selection.canceled) return;
      const asset = selection.assets[0];
      await prepareImage(asset.uri, asset.width, asset.height);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không mở được ảnh.");
    } finally { setBusy(false); }
  }

  async function prepareImage(imageUri: string, width: number, height: number) {
      // Browsers shrink the photo straight into a small canvas (large photos broke the generic
      // manipulator); native normalizes HEIC and other phone formats to the server's JPEG.
      const preparedUri =
        Platform.OS === "web"
          ? await prepareWebImage(imageUri)
          : await prepareNativeImage({ uri: imageUri, width, height });
      setUri(preparedUri);
      setConsent(false);
      setResult(null);
      setMatchedPlace(null);
      setSelectedPlace(null);
      setManualOpen(false);
      setPlaceQuery("");
  }

  async function recognize() {
    if (!uri || !consent || busy) return;
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    setMatchedPlace(null);
    setSelectedPlace(null);
    setManualOpen(false);
    setPlaceQuery("");
    const timeout = setTimeout(() => controller.abort(), 90_000);
    try {
      const response = await recognizeImage(uri, controller.signal);
      if (!controller.signal.aborted) {
        setResult(response);
        const suggestion = suggestedPlaceQuery(response);
        if (suggestion) {
          setPlaceQuery(suggestion);
          void openPlacePicker();
        }
        if (response.landmarkCode && response.recognitionStatus === "identified") {
          try {
            const place = await api<Place>(`/places/resolve?landmarkCode=${encodeURIComponent(response.landmarkCode)}`, { signal: controller.signal });
            if (!controller.signal.aborted) setMatchedPlace(place);
          } catch {
            if (!controller.signal.aborted) setError("Không tải được danh mục địa điểm từ backend.");
          }
        }
      }
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

  async function openPlacePicker() {
    setManualOpen(true);
    setSelectedPlace(null);
    setPlaceError("");
    if (places) return;
    setPlacesBusy(true);
    try {
      const data = await api<Place[]>("/places");
      if (!Array.isArray(data)) throw new Error("Danh mục địa điểm không hợp lệ.");
      setPlaces(data.filter((place) => typeof place?.id === "number" && typeof place.name === "string"));
    } catch {
      setPlaceError("Không tải được danh mục địa điểm. Vui lòng thử lại.");
    } finally {
      setPlacesBusy(false);
    }
  }

  function changeConsent(value: boolean) {
    setConsent(value);
    if (!value) pending.current?.abort();
  }

  return (
    <MotionScroll
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 100 },
      ]}
    >
      <MotionEntry section="detection-intro"><View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={28} color="#087fba" />
        </View>
        <View

        >
          <Text style={styles.heading}>
            Khám phá qua hình ảnh
          </Text>
        </View>
        <Text style={styles.body}>
          Một bức ảnh có thể mở ra cả hành trình. Chọn ảnh hoặc chụp một địa
          điểm để TravelAI giúp bạn khám phá.
        </Text>
      </View>
      </MotionEntry><MotionEntry section="detection-upload"><View style={styles.upload}>
        <Ionicons name="images-outline" size={36} color="#087fba" />
        <Text style={styles.title}>Bắt đầu với một bức ảnh</Text>
        <Text style={styles.helper}>
          Ảnh địa danh, thiên nhiên, món ăn hoặc vật phẩm văn hóa
        </Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            style={styles.primary}
            disabled={busy}
            onPress={() => chooseImage()}
          >
            <Ionicons name="image-outline" size={20} color="#fff" />
            <Text style={styles.primaryText}>Chọn ảnh từ thiết bị</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={styles.secondary}
            disabled={busy}
            onPress={() => { setShowLiveScan(false); setShowCamera(true); }}
          >
            <Ionicons name="camera-outline" size={20} color="#087fba" />
            <Text style={styles.secondaryText}>Mở camera chụp ngay</Text>
          </Pressable>
        </View>
      </View>
      </MotionEntry>{showCamera && <CapturePhoto onSelect={prepareImage} onClose={() => setShowCamera(false)} />}
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
          {!!matchedPlace && <Link href={{ pathname: "/destination/[id]", params: { id: String(matchedPlace.id) } }} style={styles.secondaryText}>Xác nhận {matchedPlace.name} và xem dịch vụ →</Link>}
          <Pressable accessibilityRole="button" style={styles.secondary} disabled={placesBusy} onPress={() => void openPlacePicker()}>
            <Text style={styles.secondaryText}>{manualOpen ? "Tải lại danh mục địa điểm" : "Chọn hoặc xác nhận địa điểm"}</Text>
          </Pressable>
          {manualOpen && (
            <View style={styles.picker}>
              <Text style={styles.body}>Tìm và chọn đúng địa điểm trong danh mục để xem tour, khách sạn cùng tỉnh.</Text>
              <TextInput accessibilityLabel="Tên địa điểm hoặc tỉnh thành" value={placeQuery} onChangeText={(text) => { setPlaceQuery(text); setSelectedPlace(null); }} placeholder="Ví dụ: Chợ Bến Thành" style={styles.input} />
              {placesBusy && <ActivityIndicator accessibilityLabel="Đang tải danh mục địa điểm" />}
              {!!placeError && <Text accessibilityRole="alert" style={styles.error}>{placeError}</Text>}
              {places && placeQuery.trim().length >= 2 && searchPlaces(places, placeQuery).length === 0 && <Text style={styles.body}>Chưa tìm thấy địa điểm trong danh mục. Hãy thử tên khác.</Text>}
              {places && searchPlaces(places, placeQuery).map((place) => (
                <Pressable key={place.id} accessibilityRole="button" accessibilityState={{ selected: selectedPlace?.id === place.id }} onPress={() => setSelectedPlace(place)} style={[styles.placeOption, selectedPlace?.id === place.id && styles.placeSelected]}>
                  <Text style={styles.secondaryText}>{place.name}{place.province ? ` · ${place.province}` : ""}</Text>
                </Pressable>
              ))}
              {selectedPlace && <Link href={{ pathname: "/destination/[id]", params: { id: String(selectedPlace.id) } }} style={styles.secondaryText}>Xác nhận {selectedPlace.name} và xem dịch vụ →</Link>}
            </View>
          )}
          <Text style={styles.body}>Nguồn xử lý {result.engine}</Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        style={styles.secondary}
        onPress={() => setShowLiveScan(!showLiveScan)}
      >
        <Ionicons name="scan-outline" size={20} color="#087fba" />
        <Text style={styles.secondaryText}>
          {showLiveScan ? "Đóng quét camera" : "Quét camera trực tiếp"}
        </Text>
      </Pressable>
      {showLiveScan && <LiveScan />}
    </MotionScroll>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 12, paddingVertical: 12 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#e4ecdc",
    alignItems: "center",
    justifyContent: "center",
  },
  upload: {
    alignItems: "center",
    gap: 12,
    padding: 32,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#a4baa0",
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  helper: { color: "#788475", textAlign: "center", lineHeight: 21 },
  primary: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#087fba",
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
    backgroundColor: "#edf2e6",
  },
  secondaryText: { color: "#087fba", fontWeight: "700", fontSize: 15 },
  screen: { flex: 1, backgroundColor: "#f2f8fc" },
  content: {
    paddingHorizontal: 24,
    gap: 20,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },
  heading: { fontSize: 28, fontWeight: "700", color: "#103c5b" },
  title: { fontSize: 22, fontWeight: "600", color: "#103c5b" },
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
  picker: { gap: 10, paddingTop: 8 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, color: "#103c5b", backgroundColor: "#fff" },
  placeOption: { padding: 12, borderRadius: 12, backgroundColor: "#f1f5f9" },
  placeSelected: { backgroundColor: "#e0ebce", borderWidth: 1, borderColor: "#087fba" },
  status: { color: "#075782", fontWeight: "600" },
  error: { color: "#b91c1c", lineHeight: 24 },
});
