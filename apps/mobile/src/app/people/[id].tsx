import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Nav,
  Screen,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { User, Post } from "@/services/types";
export default function Person() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const person = useResource<Pick<User, "id" | "name" | "bio" | "avatar">>(
    user ? `/people/${id}` : null,
  );
  const posts = useResource<Post[]>(user ? `/posts/user/${id}` : null);
  const stats = useResource<{ followers: number; following: number }>(
    user ? `/follows/stats/${id}` : null,
  );
  const follow = useResource<{ following: boolean }>(
    user ? `/follows/check?followerId=${user.id}&followingId=${id}` : null,
  );
  const action = useAction();
  return (
    <Screen title={person.data?.name || "Hồ sơ công khai"} protected>
      <ErrorText
        message={
          person.error ||
          posts.error ||
          stats.error ||
          follow.error ||
          action.error
        }
      />
      {person.data && (
        <Card>
          {!!person.data.avatar && (
            <Image
              source={{ uri: person.data.avatar }}
              style={{ width: 80, height: 80, borderRadius: 40 }}
            />
          )}
          <Text style={ui.text}>{person.data.bio}</Text>
          <Text style={ui.text}>
            {stats.data?.followers ?? 0} người theo dõi · đang theo dõi{" "}
            {stats.data?.following ?? 0} người
          </Text>
          {String(user?.id) !== id && (
            <>
              <Nav href={{ pathname: "/messages", params: { peer: id } }}>
                Nhắn tin
              </Nav>
              <Action
                title={follow.data?.following ? "Bỏ theo dõi" : "Theo dõi"}
                disabled={action.busy}
                onPress={() =>
                  action.run(async () => {
                    await api("/follows/toggle", {
                      method: "POST",
                      body: { followerId: user!.id, followingId: Number(id) },
                    });
                    follow.reload();
                    stats.reload();
                  })
                }
              />
            </>
          )}
        </Card>
      )}
      {posts.data?.map((post) => (
        <Card key={post.id}>
          <Text style={ui.text}>{post.content}</Text>
          {!!post.image && (
            <Image
              source={{ uri: post.image }}
              contentFit="contain"
              style={ui.image}
            />
          )}
        </Card>
      ))}
    </Screen>
  );
}
