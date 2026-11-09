import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { Platform } from "react-native";
import {
  api,
  ApiError,
  onSessionExpired,
  setSessionToken,
} from "@/services/api";
import type { User } from "@/services/types";

async function storedToken() {
  return Platform.OS === "web"
    ? localStorage.getItem("travelai_token")
    : SecureStore.getItemAsync("travelai_token");
}
async function persistToken(token: string | null) {
  if (Platform.OS === "web") {
    if (token) localStorage.setItem("travelai_token", token);
    else localStorage.removeItem("travelai_token");
  } else if (token) await SecureStore.setItemAsync("travelai_token", token);
  else await SecureStore.deleteItemAsync("travelai_token");
}
interface Auth {
  user: User | null;
  loading: boolean;
  error: string;
  signIn(email: string, password: string, name?: string): Promise<void>;
  signOut(): Promise<void>;
  updateUser(user: User): void;
}
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const clear = useCallback(() => {
    setSessionToken(null);
    setUser(null);
    void persistToken(null).catch(() =>
      setError("Không xóa được phiên lưu trên thiết bị."),
    );
  }, []);
  useEffect(() => {
    let active = true;
    onSessionExpired(clear);
    async function restore() {
      try {
        const token = await storedToken();
        if (!active || !token) return;
        setSessionToken(token);
        const current = await api<User>("/auth/me");
        if (active) setUser(current);
      } catch (failure) {
        if (active)
          setError(
            failure instanceof Error
              ? failure.message
              : "Không khôi phục được phiên.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void restore();
    return () => {
      active = false;
      onSessionExpired(() => {});
    };
  }, [clear]);
  async function signIn(email: string, password: string, name?: string) {
    const response = await api<{ user: User; token: string }>(
      name === undefined ? "/auth/login" : "/auth/register",
      {
        method: "POST",
        body: { email, password, name },
      },
    );
    await persistToken(response.token);
    setSessionToken(response.token);
    setUser(response.user);
    setError("");
  }
  async function signOut() {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (failure) {
      if (!(failure instanceof ApiError && failure.status === 401))
        throw failure;
    } finally {
      clear();
    }
  }
  return (
    <AuthContext.Provider
      value={{ user, loading, error, signIn, signOut, updateUser: setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthProvider missing");
  return context;
}
