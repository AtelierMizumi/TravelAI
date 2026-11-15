import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "@/services/api";

export function useResource<T>(path: string | null, pollMs = 0) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refresh = useRef<() => void>(() => {});
  const reload = useCallback(() => refresh.current(), []);
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      let pending = false;
      let refreshRequested = false;
      setData(null);
      if (!path) return () => controller.abort();
      async function load() {
        if (pending) {
          refreshRequested = true;
          return;
        }
        pending = true;
        setLoading(true);
        try {
          const value = await api<T>(path!, { signal: controller.signal });
          if (!controller.signal.aborted) {
            setData(value);
            setError("");
          }
        } catch (failure) {
          if (!controller.signal.aborted)
            setError(
              failure instanceof Error
                ? failure.message
                : "Không tải được dữ liệu.",
            );
        } finally {
          pending = false;
          if (!controller.signal.aborted) {
            setLoading(false);
            if (refreshRequested) {
              refreshRequested = false;
              void load();
            }
          }
        }
      }
      refresh.current = () => {
        void load();
      };
      void load();
      const interval = pollMs > 0 ? setInterval(load, pollMs) : undefined;
      return () => {
        controller.abort();
        clearInterval(interval);
        refresh.current = () => {};
      };
    }, [path, pollMs]),
  );
  return { data, error, loading, reload };
}
