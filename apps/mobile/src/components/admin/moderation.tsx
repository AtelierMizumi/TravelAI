import { useState } from "react";
import { Image } from "expo-image";
import { Text } from "react-native";
import { Action, Card, ErrorText, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Post } from "@/services/types";
export function AdminPosts() {
  const posts = useResource<Post[]>("/posts/admin/all");
  const action = useAction();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  async function moderate(id: number, status: string) {
    await api(`/posts/${id}/${status}`, { method: "PUT" });
    posts.reload();
  }
  return (
    <>
      <ErrorText message={posts.error || action.error} />
      {posts.data?.map((post) => (
        <Card key={post.id}>
          <Text style={ui.heading}>
            {post.authorName} · {post.status}
          </Text>
          <Text style={ui.text}>{post.content}</Text>
          {!!post.image && (
            <Image
              source={{ uri: post.image }}
              contentFit="contain"
              style={ui.image}
            />
          )}
          <Action
            title="Duyệt bài"
            disabled={action.busy}
            onPress={() => action.run(() => moderate(post.id, "approve"))}
          />
          <Action
            secondary
            title="Từ chối / gỡ công khai"
            disabled={action.busy}
            onPress={() => action.run(() => moderate(post.id, "reject"))}
          />
          <Action
            secondary
            title={confirmDelete === post.id ? "Xác nhận xóa bài" : "Xóa bài"}
            disabled={action.busy}
            onPress={() => {
              if (confirmDelete !== post.id) {
                setConfirmDelete(post.id);
                return;
              }
              void action.run(async () => {
                await api(`/posts/${post.id}`, { method: "DELETE" });
                setConfirmDelete(null);
                posts.reload();
              });
            }}
          />
        </Card>
      ))}
    </>
  );
}
