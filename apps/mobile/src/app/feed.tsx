import { useRealtime } from "@/hooks/use-realtime";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  Nav,
  Screen,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Post, User } from "@/services/types";
function PostCard({
  post,
  user,
  reload,
}: {
  post: Post;
  user: User;
  reload: () => void;
}) {
  const [comment, setComment] = useState("");
  const [caption, setCaption] = useState("");
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const action = useAction();
  const identity = {
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
  };
  const follow = useResource<{ following: boolean }>(
    post.authorId !== user.id
      ? `/follows/check?followerId=${user.id}&followingId=${post.authorId}`
      : null,
  );
  async function mutate(path: string, method: string, body?: unknown) {
    await api(path, { method, body });
    reload();
  }
  return (
    <Card>
      <View style={feedStyles.postHeader}>
        <View style={feedStyles.author}>
          {post.authorAvatar ? (
            <Image
              source={{ uri: post.authorAvatar }}
              style={feedStyles.avatar}
            />
          ) : (
            <View style={feedStyles.avatarFallback}>
              <Ionicons name="person" size={20} color="#2563eb" />
            </View>
          )}
          <View>
            <Nav
              href={{ pathname: "/people/[id]", params: { id: post.authorId } }}
            >
              {post.authorName}
            </Nav>
            <Text style={feedStyles.meta}>Thành viên TravelAI</Text>
          </View>
        </View>
        {post.authorId !== user.id && (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              action.run(async () => {
                await api("/follows/toggle", {
                  method: "POST",
                  body: { followerId: user.id, followingId: post.authorId },
                });
                follow.reload();
              })
            }
          >
            <Text style={feedStyles.follow}>
              {follow.data?.following ? "Đang theo dõi" : "+ Theo dõi"}
            </Text>
          </Pressable>
        )}
      </View>
      {editing ? (
        <Field
          label="Sửa nội dung"
          multiline
          value={content}
          onChangeText={setContent}
        />
      ) : (
        <Text style={feedStyles.postText}>{post.content}</Text>
      )}
      {!!post.image && (
        <Image
          source={{ uri: post.image }}
          contentFit="cover"
          style={feedStyles.postImage}
        />
      )}
      {!!post.status && <Text style={feedStyles.meta}>{post.status}</Text>}
      <ErrorText message={action.error || follow.error} />
      <View style={feedStyles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={post.liked ? "Bỏ thích" : "Thích"}
          onPress={() =>
            action.run(() => mutate(`/posts/${post.id}/like`, "POST", identity))
          }
          style={feedStyles.iconAction}
        >
          <Ionicons
            name={post.liked ? "heart" : "heart-outline"}
            size={22}
            color={post.liked ? "#ef4444" : "#64748b"}
          />
          <Text style={feedStyles.actionText}>{post.likesCount || 0}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bình luận"
          onPress={() => setShowComments(!showComments)}
          style={feedStyles.iconAction}
        >
          <Ionicons name="chatbubble-outline" size={21} color="#64748b" />
          <Text style={feedStyles.actionText}>
            {post.comments?.length || 0}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chia sẻ"
          onPress={() => setShowShare(!showShare)}
          style={feedStyles.iconAction}
        >
          <Ionicons name="paper-plane-outline" size={21} color="#64748b" />
          <Text style={feedStyles.actionText}>{post.shareCount || 0}</Text>
        </Pressable>
      </View>
      {post.authorId === user.id && (
        <View style={ui.row}>
          <Action
            secondary
            title={editing ? "Hủy sửa" : "Sửa bài"}
            onPress={() => setEditing(!editing)}
          />
          {editing && (
            <Action
              title="Lưu và gửi duyệt lại"
              disabled={action.busy || !content.trim()}
              onPress={() =>
                action.run(async () => {
                  await mutate(`/posts/${post.id}`, "PUT", {
                    content,
                    image: post.image,
                  });
                  setEditing(false);
                })
              }
            />
          )}
          <Action
            secondary
            title={confirmDelete ? "Xác nhận xóa bài" : "Xóa bài"}
            disabled={action.busy}
            onPress={() =>
              confirmDelete
                ? action.run(() => mutate(`/posts/${post.id}`, "DELETE"))
                : setConfirmDelete(true)
            }
          />
        </View>
      )}
      {showComments && (
        <View style={feedStyles.expanded}>
          {post.comments?.map((item) => (
            <Text key={item.id} style={ui.text}>
              <Text style={ui.label}>{item.userName}</Text> · {item.text}
            </Text>
          ))}
          <Field
            label="Viết bình luận"
            multiline
            value={comment}
            onChangeText={setComment}
          />
          <Action
            title="Gửi bình luận"
            disabled={action.busy || !comment.trim()}
            onPress={() =>
              action.run(async () => {
                await mutate(`/posts/${post.id}/comments`, "POST", {
                  ...identity,
                  text: comment,
                });
                setComment("");
              })
            }
          />
        </View>
      )}
      {showShare && (
        <View style={feedStyles.expanded}>
          <Field
            label="Lời chia sẻ"
            multiline
            value={caption}
            onChangeText={setCaption}
          />
          <Action
            title="Chia sẻ bài viết"
            disabled={action.busy}
            onPress={() =>
              action.run(async () => {
                await mutate(`/posts/${post.id}/share`, "POST", {
                  ...identity,
                  caption,
                });
                setCaption("");
                setShowShare(false);
              })
            }
          />
        </View>
      )}
    </Card>
  );
}
const feedStyles = StyleSheet.create({
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  author: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eaf2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  follow: { color: "#2563eb", fontWeight: "700", fontSize: 13 },
  meta: { color: "#94a3b8", fontSize: 12 },
  postText: { color: "#334155", fontSize: 16, lineHeight: 25 },
  postImage: {
    width: "100%",
    height: 300,
    borderRadius: 16,
    backgroundColor: "#edf2fa",
  },
  actions: {
    flexDirection: "row",
    gap: 30,
    borderTopWidth: 1,
    borderColor: "#edf1f7",
    paddingTop: 14,
  },
  iconAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    minHeight: 40,
  },
  actionText: { color: "#64748b", fontWeight: "600" },
  expanded: { gap: 10, paddingTop: 10 },
});
export default function Feed() {
  const { user } = useAuth();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const feed = useResource<Post[]>(
    user ? `/posts?userId=${user.id}` : null,
    15_000,
  );
  const own = useResource<Post[]>(
    user && edit ? `/posts/user/${user.id}` : null,
  );
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const action = useAction();
  useRealtime(() => {
    feed.reload();
    own.reload();
  }, "/topic/feed");
  async function selectImage() {
    const selected = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (selected.canceled) return;
    const asset = selected.assets[0];
    const context = ImageManipulator.manipulate(asset.uri);
    if (Math.max(asset.width, asset.height) > 1600)
      context.resize(
        asset.width >= asset.height
          ? { width: 1600, height: null }
          : { width: null, height: 1600 },
      );
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.8,
      base64: true,
    });
    setImage(`data:image/jpeg;base64,${result.base64}`);
  }
  const visible = edit
    ? own.data?.filter((post) => String(post.id) === edit)
    : feed.data;
  return (
    <Screen title="Cộng đồng du lịch" protected>
      {user && (
        <>
          <Card>
            <Text style={ui.heading}>Chia sẻ trải nghiệm</Text>
            <Field
              label="Nội dung bài viết"
              multiline
              value={content}
              onChangeText={setContent}
            />
            {!!image && (
              <Image
                source={{ uri: image }}
                contentFit="contain"
                style={ui.image}
              />
            )}
            <Action
              secondary
              title="Chọn ảnh"
              disabled={action.busy}
              onPress={() => action.run(selectImage)}
            />
            {!!image && (
              <Action secondary title="Bỏ ảnh" onPress={() => setImage("")} />
            )}
            <ErrorText message={action.error} />
            {!!message && <Text style={ui.text}>{message}</Text>}
            <Action
              title="Gửi bài chờ duyệt"
              disabled={action.busy || (!content.trim() && !image)}
              onPress={() =>
                action.run(async () => {
                  await api("/posts", {
                    method: "POST",
                    body: {
                      authorId: user.id,
                      authorName: user.name,
                      authorAvatar: user.avatar,
                      content,
                      image,
                    },
                  });
                  setContent("");
                  setImage("");
                  setMessage("Đã gửi bài chờ quản trị viên duyệt.");
                  feed.reload();
                  own.reload();
                })
              }
            />
          </Card>
          <ErrorText message={feed.error || own.error} />
          {edit && <Nav href="/feed">Xem tất cả bài viết</Nav>}
          {visible?.length === 0 && (
            <Text style={ui.text}>Chưa có bài viết.</Text>
          )}
          {visible?.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              reload={() => {
                feed.reload();
                own.reload();
              }}
            />
          ))}
        </>
      )}
    </Screen>
  );
}
