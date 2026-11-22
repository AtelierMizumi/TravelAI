import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { api } from "@/services/api";

/** `scope` identifies who the data belongs to (for example the signed-in user id); retained data is dropped when it changes. */
export function useResource<T>(path: string | null, pollMs = 0, retainOnFocus = false, scope: string | number | null = null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const previousKey = useRef<string | null | undefined>(undefined);
  const refresh = useRef<() => void>(() => {});
  const reload = useCallback(() => refresh.current(), []);
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      let pending = false;
      let refreshRequested = false;
      const key = path === null ? null : `${scope ?? ""}|${path}`;
      if (!retainOnFocus || previousKey.current !== key) setData(null);
      previousKey.current = key;
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
    }, [path, pollMs, retainOnFocus, scope]),
  );
  return { data, error, loading, reload };
}
