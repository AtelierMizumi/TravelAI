import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/context/auth";
import { apiBaseUrl, sessionToken } from "@/services/api";

/** Polling in the resource hook also recovers missed events after reconnect. */
export function useRealtime(refresh: () => void, sharedTopic?: string) {
  const { user } = useAuth();
  const latest = useRef(refresh);
  useEffect(() => {
    latest.current = refresh;
  }, [refresh]);
  useFocusEffect(
    useCallback(() => {
      const token = sessionToken();
      if (!user || !token) return;
      const client = new Client({
        brokerURL: apiBaseUrl()
          .replace(/^http/, "ws")
          .replace(/\/api$/, "/ws-native"),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 3000,
        onConnect: () => {
          for (const channel of ["messages", "notifications", "chat-unread"]) {
            client.subscribe(`/topic/${channel}/${user.id}`, () =>
              latest.current(),
            );
          }
          if (user.role === "ADMIN") client.subscribe("/topic/admin-notifications", () => latest.current());
          if (sharedTopic) client.subscribe(sharedTopic, () => latest.current());
          latest.current();
        },
      });
      client.activate();
      return () => {
        void client.deactivate();
      };
    }, [user, sharedTopic]),
  );
}
