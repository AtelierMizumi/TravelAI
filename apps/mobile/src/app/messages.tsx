import { useRealtime } from "@/hooks/use-realtime";
import { useLocalSearchParams, router } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { isVoice, VoicePlayer, VoiceRecorder } from "@/components/voice";
import {
  Action,
  Card,
  ErrorText,
  Field,
  SearchBar,
  Nav,
  Screen,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { api, operationKey } from "@/services/api";
import type { Message, User } from "@/services/types";
export default function Messages() {
  const { user } = useAuth();
  const { peer } = useLocalSearchParams<{ peer?: string }>();
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const action = useAction();
  const attempt = useRef<{ content: string; peer: string; key: string } | null>(
    null,
  );
  const voiceAttempt = useRef<{
    content: string;
    peer: string;
    key: string;
  } | null>(null);
  const people = useResource<User[]>(
    user && search.trim()
      ? `/people?q=${encodeURIComponent(search.trim())}`
      : null,
  );
  const inbox = useResource<Message[]>(
    user ? `/chat/inbox/${user.id}` : null,
    10000,
  );
  const conversation = useResource<Message[]>(
    user && peer
      ? `/chat/conversation?user1=${user.id}&user2=${encodeURIComponent(peer)}`
      : null,
    10000,
  );
  useRealtime(() => {
    conversation.reload();
    inbox.reload();
  });
  const peers = new Map<number, string>();
  inbox.data?.forEach((message) =>
    peers.set(
      message.senderId === user?.id ? message.receiverId : message.senderId,
      message.senderId === user?.id ? message.receiverName : message.senderName,
    ),
  );
  return (
    <Screen title="Tin nhắn" protected>
      <ErrorText
        message={
          people.error || inbox.error || conversation.error || action.error
        }
      />
      <Text style={ui.text}>Tìm bạn đồng hành hoặc mở cuộc trò chuyện gần đây.</Text>
      <SearchBar loading={people.loading} label="Tìm người dùng" value={search} onChangeText={setSearch} />
      {people.data
        ?.filter((person) => person.id !== user?.id)
        .map((person) => (
          <PersonRow key={person.id} person={person} userId={user!.id} />
        ))}
      {!peer && <Text style={ui.heading}>Cuộc trò chuyện</Text>}
      {!peer &&
        [...peers].map(([id, name]) => (
          <Nav key={id} href={{ pathname: "/messages", params: { peer: id } }}>
            💬 {name} →
          </Nav>
        ))}
      {!peer && peers.size === 0 && (
        <Text style={ui.text}>
          Tìm một người dùng và nhấn Nhắn tin để bắt đầu.
        </Text>
      )}
      {peer && (
        <Card>
          <View style={msgStyles.header}>
            <View style={msgStyles.avatar}>
              <Ionicons name="person" size={23} color="#087fba" />
            </View>
            <View>
              <Text style={ui.heading}>
                {peers.get(Number(peer)) || "Cuộc trò chuyện"}
              </Text>
              <Text style={msgStyles.meta}>Tin nhắn riêng tư</Text>
            </View>
          </View>
          {conversation.data?.map((message) => {
            const own = message.senderId === user?.id;
            const avatar = own ? user?.avatar : people.data?.find(person => person.id === message.senderId)?.avatar;
            const portrait = <View style={msgStyles.messageAvatar}>
              {avatar ? <Image source={avatar} accessibilityLabel={own ? "Ảnh đại diện của bạn" : `Ảnh đại diện ${message.senderName}`} style={{ width: 28, height: 28, borderRadius: 14 }} /> : <Text style={{ color: "#17678e", fontSize: 12, fontWeight: "700" }}>{message.senderName?.trim().charAt(0).toUpperCase() || "?"}</Text>}
            </View>;
            return <View key={message.id} testID={`message-${message.id}`} style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: own ? "flex-end" : "flex-start", gap: 8, width: "100%" }}>
              {!own && portrait}
              <View style={[msgStyles.bubble, { backgroundColor: own ? "#0879ad" : "#edf5fb", borderBottomLeftRadius: own ? 18 : 5, borderBottomRightRadius: own ? 5 : 18, minWidth: 0, maxWidth: "82%" }]}>
                <Text style={[ui.label, { color: own ? "#e2f5ff" : "#246182", fontSize: 12 }]}>{own ? "Bạn" : message.senderName}</Text>
                {isVoice(message.content) ? <VoicePlayer content={message.content} /> : <Text style={[ui.text, { color: own ? "#ffffff" : "#173e59", lineHeight: 23 }]}>{message.content}</Text>}
                <Text style={[msgStyles.meta, { color: own ? "#e0f3ff" : "#526c80", alignSelf: "flex-end", fontSize: 11 }]}>{new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</Text>
              </View>
              {own && portrait}
            </View>;
          })}
          <Field
            label="Tin nhắn mới"
            multiline
            value={text}
            onChangeText={setText}
          />
          <VoiceRecorder
            key={peer}
            destination="user"
            disabled={action.busy}
            onSend={async (content) => {
              if (
                !voiceAttempt.current ||
                voiceAttempt.current.content !== content ||
                voiceAttempt.current.peer !== peer
              )
                voiceAttempt.current = { content, peer, key: operationKey() };
              await api("/chat/send", {
                method: "POST",
                body: {
                  receiverId: Number(peer),
                  content,
                  clientMessageId: voiceAttempt.current.key,
                },
              });
              voiceAttempt.current = null;
              conversation.reload();
              inbox.reload();
            }}
          />
          <Action
            title="Gửi"
            disabled={action.busy || !text.trim()}
            onPress={() =>
              action.run(async () => {
                if (
                  !attempt.current ||
                  attempt.current.content !== text ||
                  attempt.current.peer !== peer
                )
                  attempt.current = {
                    content: text,
                    peer,
                    key: operationKey(),
                  };
                await api("/chat/send", {
                  method: "POST",
                  body: {
                    receiverId: Number(peer),
                    content: text,
                    clientMessageId: attempt.current.key,
                  },
                });
                setText("");
                attempt.current = null;
                conversation.reload();
                inbox.reload();
              })
            }
          />
          <Action
            secondary
            title="Đánh dấu đã đọc"
            disabled={action.busy}
            onPress={() =>
              action.run(async () => {
                await api(
                  `/chat/read?currentUserId=${user!.id}&otherUserId=${peer}`,
                  { method: "PUT" },
                );
                inbox.reload();
              })
            }
          />
          <Action
            secondary
            title="Đóng cuộc trò chuyện"
            onPress={() => router.replace("/messages")}
          />
        </Card>
      )}
    </Screen>
  );
}

function PersonRow({ person, userId }: { person: User; userId: number }) {
  const follow = useResource<{ following: boolean }>(
    `/follows/check?followerId=${userId}&followingId=${person.id}`,
  );
  const action = useAction();
  return (
    <Card>
      <View style={msgStyles.personRow}>
        <View style={msgStyles.personInfo}>
          {person.avatar ? (
            <Image source={{ uri: person.avatar }} style={msgStyles.avatar} />
          ) : (
            <View style={msgStyles.avatar}>
              <Ionicons name="person" size={22} color="#087fba" />
            </View>
          )}
          <Text style={ui.label}>{person.name}</Text>
        </View>
        <Nav href={{ pathname: "/messages", params: { peer: person.id } }}>
          Nhắn tin
        </Nav>
        <Pressable
          accessibilityRole="button"
          disabled={action.busy}
          onPress={() =>
            action.run(async () => {
              await api("/follows/toggle", {
                method: "POST",
                body: { followerId: userId, followingId: person.id },
              });
              follow.reload();
            })
          }
        >
          <Text style={msgStyles.follow}>
            {follow.data?.following ? "Đang theo dõi" : "+ Theo dõi"}
          </Text>
        </Pressable>
      </View>
      <ErrorText message={action.error || follow.error} />
    </Card>
  );
}
const msgStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eef7",
    paddingBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e2f3fc",
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { fontSize: 12, color: "#788475" },
  bubble: { borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, gap: 4 },
  messageAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#e0f0fa", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  personRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexGrow: 1,
  },
  follow: { color: "#087fba", fontWeight: "700" },
});
