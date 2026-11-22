import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Modal, Platform, StyleSheet, Text, View } from "react-native";
import { Action, ErrorText, ui } from "@/components/ui";

export function CapturePhoto({ onSelect, onClose }: { onSelect: (uri: string, width: number, height: number) => Promise<void>; onClose: () => void }) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const active = useRef(true);
  const taking = useRef(false);
  const [focused, setFocused] = useState(true);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState<"back" | "front">("back");
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<{ uri: string; width: number; height: number } | null>(null);
  useFocusEffect(useCallback(() => {
    active.current = true; setFocused(true);
    return () => { active.current = false; setFocused(false); };
  }, []));
  function close() { active.current = false; onClose(); }
  async function capture() {
    if (!ready || taking.current || !camera.current) return;
    taking.current = true; setBusy(true); setError("");
    try {
      const picture = await camera.current.takePictureAsync({ quality: 0.85 });
      if (picture && active.current) setPhoto(picture);
    } catch { if (active.current) setError("Không chụp được ảnh. Hãy thử lại hoặc chọn ảnh từ thư viện."); }
    finally { taking.current = false; if (active.current) setBusy(false); }
  }
  if (!focused) return null;
  return <Modal visible animationType="none" onRequestClose={close}>
    <View style={styles.screen}>
      <View style={styles.content}>
        <Text style={ui.heading}>Chụp địa điểm trước mắt bạn</Text>
        <Text style={ui.text}>Đưa địa danh vào khung hình. Bạn được xem lại ảnh trước khi gửi nhận diện.</Text>
        {!permission?.granted ? <>
          <Text style={ui.text}>{permission?.canAskAgain === false ? "Camera đang bị chặn. Mở cài đặt quyền camera của thiết bị hoặc trình duyệt, hoặc quay lại chọn ảnh có sẵn." : "Cho phép camera để chụp ảnh ngay tại đây."}{Platform.OS === "web" ? " Camera cần kết nối HTTPS hoặc localhost." : ""}</Text>
          <Action title="Cho phép sử dụng camera" disabled={permission?.canAskAgain === false} onPress={() => void requestPermission().catch(() => setError("Không xin được quyền camera."))} />
        </> : photo ? <>
          <Image source={{ uri: photo.uri }} style={styles.camera} contentFit="contain" accessibilityLabel="Ảnh vừa chụp, chưa gửi đi" />
          <Action title={busy ? "Đang chuẩn bị ảnh…" : "Dùng ảnh này"} disabled={busy} onPress={async () => {
            if (busy) return;
            setBusy(true);
            try { await onSelect(photo.uri, photo.width, photo.height); close(); }
            catch { setError("Không xử lý được ảnh. Vui lòng chụp lại."); }
            finally { if (active.current) setBusy(false); }
          }} />
          <Action secondary title="Chụp lại" disabled={busy} onPress={() => { setPhoto(null); setReady(false); }} />
        </> : <>
          <CameraView ref={camera} facing={facing} style={styles.camera} onCameraReady={() => setReady(true)} onMountError={() => { setReady(false); setError("Không mở được camera. Kiểm tra quyền truy cập, đóng ứng dụng khác đang dùng camera hoặc chọn ảnh có sẵn."); }} />
          <Action title={busy ? "Đang chụp…" : "Chụp ảnh"} disabled={!ready || busy} onPress={() => void capture()} />
          <Action secondary title="Đổi camera trước / sau" disabled={busy} onPress={() => { setReady(false); setFacing(facing === "back" ? "front" : "back"); }} />
        </>}
        <ErrorText message={error} />
        <Action secondary title="Đóng camera" onPress={close} />
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f2f8fc", justifyContent: "center", padding: 20 },
  content: { gap: 12, width: "100%", maxWidth: 560, alignSelf: "center" },
  camera: { width: "100%", aspectRatio: 4 / 3, maxHeight: 420, borderRadius: 20, overflow: "hidden", backgroundColor: "#103c5b" },
});
