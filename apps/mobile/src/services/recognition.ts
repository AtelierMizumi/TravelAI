import Constants from "expo-constants";
import { Platform } from "react-native";
import { appendImagePart } from "./recognitionForm";

export interface RecognitionResult {
  success: boolean;
  displayName: string;
  name: string | null;
  recognitionStatus: "identified" | "predicted" | "unknown";
  description: string;
  reason: string;
  engine: string;
  labels: string[];
  objects: string[];
  objectBounds?: {
    name: string;
    score: number;
    vertices: { x: number; y: number }[];
  }[];
  knowledgeUrl?: string;
  knowledgeSource?: string;
  coordinates?: { latitude: number; longitude: number };
  ocrText?: string;
}

export function recognitionApiUrl() {
  const configured = process.env.EXPO_PUBLIC_AI_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  if (Platform.OS === "web")
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return `http://${new URL(`http://${hostUri}`).hostname}:8000`;
  throw new Error(
    "Chưa cấu hình EXPO_PUBLIC_AI_API_URL cho địa chỉ AI Service.",
  );
}

export async function recognizeImage(
  uri: string,
  signal: AbortSignal,
): Promise<RecognitionResult> {
  const body = new FormData();
  await appendImagePart(body, uri, signal);
  body.append("consent", "true");
  const response = await fetch(`${recognitionApiUrl()}/detect`, {
    method: "POST",
    body,
    signal,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new Error(
      data?.detail || `AI Service trả lỗi HTTP ${response.status}.`,
    );
  if (
    !data ||
    typeof data.success !== "boolean" ||
    typeof data.description !== "string"
  ) {
    throw new Error("AI Service trả kết quả không hợp lệ.");
  }
  return data;
}
