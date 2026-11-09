import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { Action, Card, ErrorText, ui } from "@/components/ui";
import { recognizeImage, type RecognitionResult } from "@/services/recognition";

/** One in-flight request at a time; users explicitly start and stop cloud scanning. */
export function LiveScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [consent, setConsent] = useState(false);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [frame, setFrame] = useState<{
    uri: string;
    ratio: number;
    result: RecognitionResult;
  } | null>(null);
  const camera = useRef<CameraView>(null);
  const pending = useRef<AbortController | null>(null);
  useFocusEffect(
    useCallback(
      () => () => {
        pending.current?.abort();
        setRunning(false);
        setReady(false);
      },
      [],
    ),
  );
  useEffect(() => {
    if (!running || !ready || !consent) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function scan() {
      if (stopped || !camera.current) return;
      try {
        const picture = await camera.current.takePictureAsync({
          quality: 0.35,
          skipProcessing: false,
        });
        if (!picture || stopped) return;
        const controller = new AbortController();
        pending.current = controller;
        const timeout = setTimeout(() => controller.abort(), 90_000);
        try {
          const result = await recognizeImage(picture.uri, controller.signal);
          if (!stopped) {
            setFrame({
              uri: picture.uri,
              ratio: picture.width / picture.height || 1,
              result,
            });
            setError("");
          }
        } finally {
          clearTimeout(timeout);
          if (pending.current === controller) pending.current = null;
        }
      } catch (failure) {
        if (!stopped) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Không quét được khung hình.",
          );
          setRunning(false);
        }
      }
      if (!stopped) timer = setTimeout(scan, 8000);
    }
    void scan();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      pending.current?.abort();
    };
  }, [running, ready, consent]);
  async function start() {
    if (!consent) return;
    const next = permission?.granted ? permission : await requestPermission();
    if (!next.granted) {
      setError("Cần cho phép camera để quét hình ảnh.");
      return;
    }
    setError("");
    setFrame(null);
    setReady(false);
    setRunning(true);
  }
  return (
    <Card>
      <Text style={ui.heading}>Quét bằng camera</Text>
      <Text style={ui.text}>
        Khi bật quét, ảnh từ camera được gửi định kỳ đến Google Cloud Vision (có
        thể phát sinh phí). Tránh hướng camera vào người hoặc dữ liệu riêng tư.
        Dừng quét bất cứ lúc nào.
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Switch
          accessibilityLabel="Đồng ý gửi các khung hình đến Google Cloud Vision"
          value={consent}
          onValueChange={(value) => {
            setConsent(value);
            if (!value) {
              pending.current?.abort();
              setRunning(false);
              setReady(false);
            }
          }}
        />
        <Text style={[ui.text, { flex: 1 }]}>
          Tôi đồng ý gửi khung hình để phân tích.
        </Text>
      </View>
      {running ? (
        <>
          <CameraView
            ref={camera}
            style={styles.camera}
            facing="back"
            onCameraReady={() => setReady(true)}
            onMountError={() => {
              setError("Không mở được camera.");
              setRunning(false);
            }}
          />
          <Action
            title="Dừng quét và tắt camera"
            onPress={() => {
              pending.current?.abort();
              setRunning(false);
              setReady(false);
            }}
          />
        </>
      ) : (
        <Action
          title="Bật camera và bắt đầu quét"
          disabled={!consent}
          onPress={() => void start()}
        />
      )}
      <ErrorText message={error} />
      {frame && (
        <>
          <Text style={ui.heading}>Khung hình vừa phân tích</Text>
          <View style={[styles.frame, { aspectRatio: frame.ratio }]}>
            <Image
              source={{ uri: frame.uri }}
              contentFit="fill"
              style={StyleSheet.absoluteFill}
            />
            {frame.result.objectBounds?.map((object, index) => {
              if (object.vertices.length < 2) return null;
              const xs = object.vertices.map((v) =>
                Math.max(0, Math.min(1, v.x)),
              );
              const ys = object.vertices.map((v) =>
                Math.max(0, Math.min(1, v.y)),
              );
              const left = Math.min(...xs) * 100,
                top = Math.min(...ys) * 100,
                width = (Math.max(...xs) - Math.min(...xs)) * 100,
                height = (Math.max(...ys) - Math.min(...ys)) * 100;
              return (
                <View
                  key={index}
                  style={[
                    styles.box,
                    {
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    },
                  ]}
                >
                  <Text numberOfLines={1} style={styles.boxLabel}>
                    {object.name}
                  </Text>
                </View>
              );
            })}
          </View>
          <Text style={ui.text}>
            {frame.result.displayName || "Chưa xác định"}:{" "}
            {frame.result.description}
          </Text>
          <Text style={styles.note}>
            Nhãn và khung là dự đoán trên ảnh vừa chụp, có thể trễ hoặc sai;
            Google Vision không bảo đảm nhận diện cụ thể món ăn hay hiện vật
            Việt Nam.
          </Text>
        </>
      )}
    </Card>
  );
}
const styles = StyleSheet.create({
  camera: {
    width: "100%",
    aspectRatio: 3 / 4,
    maxHeight: 480,
    borderRadius: 16,
    overflow: "hidden",
  },
  frame: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  box: { position: "absolute", borderColor: "#3b82f6", borderWidth: 2 },
  boxLabel: {
    color: "white",
    backgroundColor: "#1d4ed8",
    fontSize: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 4,
  },
  note: { color: "#64748b", fontSize: 13, lineHeight: 20 },
});
