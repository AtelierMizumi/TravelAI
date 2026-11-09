import { BankPanel } from "@/components/bank-panel";
import { useRealtime } from "@/hooks/use-realtime";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useState } from "react";
import { Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  money,
  Nav,
  Screen,
  serviceTime,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Bank, Booking, Post, User } from "@/services/types";
function ProfileEditor({ user }: { user: User }) {
  const auth = useAuth();
  const action = useAction();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);
  const [avatar, setAvatar] = useState(user.avatar);
  const [saved, setSaved] = useState(false);
  return (
    <Card>
      <Text style={ui.heading}>Thông tin cá nhân</Text>
      <Field label="Tên" value={name} onChangeText={setName} />
      <Field label="Giới thiệu" multiline value={bio} onChangeText={setBio} />
      {!!avatar && (
        <Image
          source={{ uri: avatar }}
          style={{ width: 88, height: 88, borderRadius: 44 }}
        />
      )}
      <Action
        secondary
        title="Chọn ảnh đại diện"
        disabled={action.busy}
        onPress={() =>
          action.run(async () => {
            const selected = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (selected.canceled) return;
            const image = ImageManipulator.manipulate(selected.assets[0].uri);
            image.resize({ width: 256, height: 256 });
            const rendered = await image.renderAsync();
            const result = await rendered.saveAsync({
              format: SaveFormat.JPEG,
              compress: 0.65,
              base64: true,
            });
            if (!result.base64 || result.base64.length > 199_970)
              throw new Error("Ảnh quá lớn, vui lòng chọn ảnh khác.");
            setAvatar(`data:image/jpeg;base64,${result.base64}`);
            setSaved(false);
          })
        }
      />
      <ErrorText message={action.error} />
      {saved && <Text style={ui.text}>Đã lưu hồ sơ.</Text>}
      <Action
        title="Lưu hồ sơ"
        disabled={action.busy || !name.trim()}
        onPress={() =>
          action.run(async () => {
            const response = await api<{ user: User }>(
              `/auth/profile/${user.id}`,
              { method: "PUT", body: { name, bio, avatar } },
            );
            auth.updateUser(response.user);
            setSaved(true);
          })
        }
      />
    </Card>
  );
}
interface LegacyBooking {
  id: number;
  tourName?: string;
  hotelName?: string;
  status: string;
  bookingDate?: string;
  checkIn?: string;
  checkOut?: string;
  guests: number;
}
export default function Profile() {
  const { user, signOut } = useAuth();
  const bookings = useResource<Booking[]>(user ? "/booking/bookings" : null);
  const bank = useResource<Bank>(user ? "/booking/bank" : null);
  const posts = useResource<Post[]>(user ? `/posts/user/${user.id}` : null);
  const tours = useResource<LegacyBooking[]>(
    user ? `/tour-bookings/user/${user.id}` : null,
  );
  const hotels = useResource<LegacyBooking[]>(
    user ? `/hotel-bookings/user/${user.id}` : null,
  );
  const follows = useResource<{ followers: number; following: number }>(
    user ? `/follows/stats/${user.id}` : null,
  );
  const action = useAction();
  useRealtime(() => {
    bookings.reload();
    bank.reload();
    posts.reload();
  });
  return (
    <Screen title="Hồ sơ của bạn" protected>
      {user && <ProfileEditor key={user.id} user={user} />}
      <ErrorText
        message={
          bookings.error ||
          bank.error ||
          posts.error ||
          follows.error ||
          tours.error ||
          hotels.error ||
          action.error
        }
      />
      <Text style={ui.text}>
        {follows.data?.followers ?? 0} người theo dõi · đang theo dõi{" "}
        {follows.data?.following ?? 0} người
      </Text>
      {(["TOUR", "HOTEL"] as const).map((kind) => (
        <View key={kind} style={{ gap: 14 }}>
          <Text style={ui.heading}>
            {kind === "TOUR" ? "Tour đã đặt" : "Khách sạn đã đặt"}
          </Text>
          {bookings.data
            ?.filter(
              (booking) =>
                booking.ownerId === user?.id && booking.itinerary.kind === kind,
            )
            .map((booking) => (
              <Card key={booking.id}>
                <Text style={ui.heading}>{booking.itinerary.name}</Text>
                <Text style={ui.text}>
                  {booking.status} · {serviceTime(booking.itinerary.start)} ·{" "}
                  {booking.itinerary.selection.guests} khách
                </Text>
                <Text style={ui.text}>
                  Tổng thanh toán {money(booking.totalPaid)}
                </Text>
                <Nav
                  href={{
                    pathname: "/bookings/[id]",
                    params: { id: booking.id },
                  }}
                >
                  Quản lý lịch trình →
                </Nav>
              </Card>
            ))}
          {bookings.data?.filter(
            (booking) =>
              booking.ownerId === user?.id && booking.itinerary.kind === kind,
          ).length === 0 && (
            <Text style={ui.text}>Chưa có chuyến đi trong mục này.</Text>
          )}
        </View>
      ))}
      {[...(tours.data || []), ...(hotels.data || [])].map((booking) => (
        <Card key={`${booking.tourName ? "T" : "H"}${booking.id}`}>
          <Text style={ui.heading}>
            {booking.tourName || booking.hotelName}
          </Text>
          <Text style={ui.text}>
            Hồ sơ cũ · {booking.status} ·{" "}
            {booking.bookingDate || booking.checkIn} · {booking.guests} khách
          </Text>
        </Card>
      ))}
      <BankPanel data={bank.data} reload={bank.reload} />
      <Text style={ui.heading}>Bài viết của tôi</Text>
      {posts.data?.map((post) => (
        <Card key={post.id}>
          <Text style={ui.text}>{post.content}</Text>
          <Text style={ui.text}>{post.status}</Text>
          <Nav href={{ pathname: "/feed", params: { edit: post.id } }}>
            Xem và sửa bài viết
          </Nav>
        </Card>
      ))}
      <Action
        secondary
        title="Đăng xuất"
        disabled={action.busy}
        onPress={() => action.run(signOut)}
      />
    </Screen>
  );
}
