import Constants from "expo-constants";
import { randomUUID } from "expo-crypto";
import { Platform } from "react-native";
import { requestJson } from "./transport";
import { resolveBackendUrl } from "./backend-url";
export { ApiError } from "./transport";

let token: string | null = null;
let expired = () => {};
export function sessionToken() {
  return token;
}
export function setSessionToken(value: string | null) {
  token = value;
}
export function onSessionExpired(callback: () => void) {
  expired = callback;
}
export function apiBaseUrl() {
  return resolveBackendUrl({
    configured: process.env.EXPO_PUBLIC_API_URL,
    webOrigin: Platform.OS === "web" ? window.location.origin : undefined,
    expoHost: Constants.expoConfig?.hostUri,
  });
}

export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    key?: string;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.key) headers["Idempotency-Key"] = options.key;
  return requestJson<T>(
    `${apiBaseUrl()}${path}`,
    {
      method: options.method || "GET",
      headers,
      signal: options.signal,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    },
    () => {
      if (token) expired();
    },
  );
}
export function operationKey() {
  return randomUUID();
}
