import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  Screen,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { api } from "@/services/api";
import { VoiceRecorder } from "@/components/voice";

type Turn = { role: "user" | "model"; text: string };
export default function AiChat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const action = useAction();
  const activeRequest = useRef(false);
  useFocusEffect(useCallback(() => () => { void Speech.stop(); }, []));
  async function exclusive(work: () => Promise<void>) {
    if (activeRequest.current) throw new Error("Vui lòng chờ câu trả lời trước khi gửi tiếp.");
    activeRequest.current = true;
    try { await work(); } finally { activeRequest.current = false; }
  }
  return (
    <Screen title="Trợ lý du lịch AI" protected>
      <Text style={ui.text}>
        Tin nhắn bạn gửi ở đây được chuyển tới Google Gemini để trả lời. Không
        gửi mật khẩu, thông tin thẻ hoặc dữ liệu riêng tư. Nội dung trả lời có
        thể không chính xác.
      </Text>
      <Card>
        {turns.length === 0 && (
          <Text style={ui.text}>Bạn muốn tìm hiểu điều gì về chuyến đi?</Text>
        )}
        {turns.map((turn, index) => (
          <View
            key={index}
            style={{
              alignSelf: turn.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: turn.role === "user" ? "#e8f0ff" : "#f3f6fa",
              padding: 14,
              borderRadius: 14,
              maxWidth: "90%",
            }}
          >
            <Text style={ui.text}>{turn.text}</Text>
            {turn.role === "model" && (
              <Action
                secondary
                title="Nghe câu trả lời"
                onPress={() => {
                  void Speech.stop().then(() =>
                    Speech.speak(
                      turn.text.slice(0, Speech.maxSpeechInputLength),
                      { language: "vi-VN" },
                    ),
                  );
                }}
              />
            )}
          </View>
        ))}
        <Field
          label="Câu hỏi của bạn"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={3000}
        />
        <VoiceRecorder
          destination="ai"
          disabled={action.busy || !user}
          onSend={(audio) => exclusive(async () => {
            const response = await api<{ answer: string }>("/ai/voice", {
              method: "POST",
              body: { audio },
            });
            setTurns((current) => [
              ...current,
              { role: "user", text: "[Câu hỏi bằng giọng nói]" },
              { role: "model", text: response.answer },
            ]);
          })}
        />
        <ErrorText message={action.error} />
        <Action
          title={action.busy ? "Đang hỏi Gemini…" : "Gửi tới Gemini"}
          disabled={!user || action.busy || !message.trim()}
          onPress={() =>
            action.run(() => exclusive(async () => {
              const next: Turn[] = [
                ...turns,
                { role: "user" as const, text: message.trim() },
              ].slice(-11);
              const result = await api<{ answer: string }>("/ai/chat", {
                method: "POST",
                body: { messages: next },
              });
              setTurns([...next, { role: "model", text: result.answer }]);
              setMessage("");
            }))
          }
        />
      </Card>
      <Text style={ui.text}>
        Cuộc trò chuyện này chỉ lưu trong phiên màn hình hiện tại.
      </Text>
    </Screen>
  );
}
