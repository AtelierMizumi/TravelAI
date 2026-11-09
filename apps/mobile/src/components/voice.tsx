import { randomUUID } from "expo-crypto";
import { File, Paths } from "expo-file-system";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from "expo-audio";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import { Action, ErrorText, ui, useAction } from "@/components/ui";

const prefix = "VOICE_V1|";
export const isVoice = (content: string) => content.startsWith(prefix);
function parse(content: string) {
  const match = /^VOICE_V1\|(audio\/m4a|audio\/webm)\|([A-Za-z0-9+/=]+)$/.exec(
    content,
  );
  return match ? { mime: match[1], base64: match[2] } : null;
}
function discardRecording(uri: string | null) {
  if (!uri) return;
  if (Platform.OS === "web") URL.revokeObjectURL(uri);
  else {
    const file = new File(uri);
    if (file.exists) file.delete();
  }
}
async function readRecording(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const mime = blob.type.startsWith("audio/mp4")
        ? "audio/m4a"
        : blob.type.startsWith("audio/webm")
          ? "audio/webm"
          : "";
      if (!mime)
        throw new Error("Trình duyệt không hỗ trợ định dạng ghi âm phù hợp.");
      if (blob.size > 600_000)
        throw new Error("Bản ghi vượt 600 KB; hãy ghi ngắn hơn.");
      const encoded = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Không đọc được bản ghi âm."));
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.readAsDataURL(blob);
      });
      return `${prefix}${mime}|${encoded}`;
    } finally {
      URL.revokeObjectURL(uri);
    }
  }
  const file = new File(uri);
  try {
    if (file.size > 600_000)
      throw new Error("Bản ghi vượt 600 KB; hãy ghi ngắn hơn.");
    return `${prefix}audio/m4a|${await file.base64()}`;
  } finally {
    if (file.exists) file.delete();
  }
}

export function VoiceRecorder({
  onSend,
  destination,
  disabled = false,
}: {
  onSend: (content: string) => Promise<void>;
  destination: "user" | "ai";
  disabled?: boolean;
}) {
  const [recording, setRecording] = useState(false);
  const [clip, setClip] = useState("");
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focused = useRef(false);
  const starting = useRef(false);
  const webMime =
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "audio/webm";
  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    web: { ...RecordingPresets.HIGH_QUALITY.web, mimeType: webMime },
  });
  const busy = useAction();
  const stopping = useRef(false);
  const stop = useCallback(async () => {
    if (stopping.current) return;
    stopping.current = true;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    try {
      await recorder.stop();
      setRecording(false);
      if (!recorder.uri) throw new Error("Không lưu được bản ghi âm.");
      if (!focused.current) {
        discardRecording(recorder.uri);
        return;
      }
      const next = await readRecording(recorder.uri);
      if (focused.current) setClip(next);
    } catch (failure) {
      setRecording(false);
      setError(
        failure instanceof Error ? failure.message : "Không dừng được ghi âm.",
      );
    } finally {
      stopping.current = false;
    }
  }, [recorder]);
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      return () => {
        focused.current = false;
        if (timer.current) clearTimeout(timer.current);
        if (recorder.isRecording && !stopping.current)
          void recorder
            .stop()
            .then(() => discardRecording(recorder.uri))
            .catch(() => {});
        setRecording(false);
      };
    }, [recorder]),
  );
  async function start() {
    if (starting.current) return;
    starting.current = true;
    try {
      setError("");
      setClip("");
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) throw new Error("Cần cho phép micro để ghi âm.");
      if (!focused.current) return;
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record({ forDuration: 21 });
      if (!focused.current) {
        await recorder.stop();
        discardRecording(recorder.uri);
        return;
      }
      setRecording(true);
      timer.current = setTimeout(() => void stop(), 20_000);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Không mở được micro.",
      );
    } finally {
      starting.current = false;
    }
  }
  return (
    <View style={{ gap: 10 }}>
      <Text style={ui.label}>
        {destination === "ai" ? "Câu hỏi bằng giọng nói" : "Tin nhắn thoại"}
      </Text>
      <Text style={ui.text}>
        {destination === "ai"
          ? "Bản ghi chỉ được gửi tới Google Gemini sau khi bạn bấm gửi; Gemini trả lời bằng chữ và bạn có thể bật đọc thành tiếng."
          : "Ghi âm tối đa 20 giây. Bản ghi được mã hóa khi lưu trên máy chủ."}
      </Text>
      <ErrorText message={error || busy.error} />
      {recording ? (
        <Action title="Dừng ghi âm" onPress={() => void stop()} />
      ) : (
        <Action
          secondary
          title="Bật micro và ghi âm"
          disabled={disabled || busy.busy}
          onPress={() => void start()}
        />
      )}
      {!!clip && !recording && (
        <>
          <VoicePlayer content={clip} />
          <View style={ui.row}>
            <Action
              title={
                destination === "ai"
                  ? "Gửi giọng nói tới Gemini"
                  : "Gửi tin nhắn thoại"
              }
              disabled={disabled || busy.busy}
              onPress={() =>
                busy.run(async () => {
                  await onSend(clip);
                  setClip("");
                })
              }
            />
            <Action secondary title="Bỏ bản ghi" onPress={() => setClip("")} />
          </View>
        </>
      )}
    </View>
  );
}
export function VoicePlayer({ content }: { content: string }) {
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState("");
  const player = useAudioPlayer(source);
  const state = useAudioPlayerStatus(player);
  useEffect(() => {
    const audio = parse(content);
    if (!audio) return;
    let cancelled = false;
    let file: File | null = null;
    async function prepare() {
      try {
        if (Platform.OS === "web") {
          if (!cancelled)
            setSource(
              `data:${audio!.mime === "audio/m4a" ? "audio/mp4" : audio!.mime};base64,${audio!.base64}`,
            );
        } else {
          file = new File(
            Paths.cache,
            `travelai-${randomUUID()}.${audio!.mime === "audio/m4a" ? "m4a" : "webm"}`,
          );
          file.create();
          await file.write(audio!.base64, { encoding: "base64" });
          if (!cancelled) setSource(file.uri);
          else if (file.exists) file.delete();
        }
      } catch {
        if (!cancelled) setError("Không mở được bản ghi trên thiết bị này.");
      }
    }
    void prepare();
    return () => {
      cancelled = true;
      if (file?.exists) file.delete();
    };
  }, [content]);
  return (
    <View style={{ gap: 5 }}>
      <Action
        secondary
        title={state.playing ? "Tạm dừng giọng nói" : "Nghe bản ghi"}
        disabled={!source}
        onPress={() => (state.playing ? player.pause() : player.play())}
      />
      <ErrorText message={error} />
    </View>
  );
}
