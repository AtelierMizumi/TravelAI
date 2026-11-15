import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import {
  Action,
  Card,
  ErrorText,
  Field,
  serviceTime,
  ui,
  useAction,
} from "@/components/ui";
import { api } from "@/services/api";
import { useResource } from "@/hooks/use-resource";

type Rating = {
  id: string;
  authorName: string;
  stars: number;
  comment: string;
  image: string | null;
  createdAt: string;
};
type Result = { items: Rating[]; count: number; hasMore: boolean };
export function Ratings({ kind, id }: { kind: "TOUR" | "HOTEL"; id: string }) {
  const [sort, setSort] = useState<"top" | "recent">("top");
  const [stars, setStars] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const result = useResource<Result>(
    `/ratings/${kind}/${encodeURIComponent(id)}?sort=${sort}&stars=${stars}&page=${page}`,
  );
  const items = expanded ? result.data?.items : result.data?.items.slice(0, 3);
  const reset = () => {
    setExpanded(false);
    setPage(0);
  };
  return (
    <Card>
      <Text style={ui.heading}>Đánh giá của khách</Text>
      <Text style={ui.text}>
        Đánh giá từ khách có đặt chỗ đã hoàn tất · {result.data?.count ?? 0} kết
        quả
      </Text>
      <View style={ui.row}>
        <Action
          title="Nhiều sao nhất"
          secondary={sort !== "top"}
          onPress={() => {
            setSort("top");
            reset();
          }}
        />
        <Action
          title="Mới nhất"
          secondary={sort !== "recent"}
          onPress={() => {
            setSort("recent");
            reset();
          }}
        />
      </View>
      <View style={ui.row}>
        {[0, 5, 4, 3, 2, 1].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: stars === value }}
            onPress={() => {
              setStars(value);
              reset();
            }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 15,
              backgroundColor: stars === value ? "#dceaff" : "#f1f5f9",
            }}
          >
            <Text style={{ color: "#1e40af" }}>
              {value ? `${value} ★` : "Tất cả"}
            </Text>
          </Pressable>
        ))}
      </View>
      <ErrorText message={result.error} />
      {result.loading && <Text style={ui.text}>Đang tải đánh giá…</Text>}
      {!result.loading && result.data?.count === 0 && (
        <Text style={ui.text}>Chưa có đánh giá phù hợp.</Text>
      )}
      {items?.map((item) => (
        <View
          key={item.id}
          style={{
            gap: 8,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderColor: "#e5edf7",
          }}
        >
          <Text style={ui.label}>
            {item.authorName} · {"★".repeat(item.stars)} ·{" "}
            {serviceTime(item.createdAt)}
          </Text>
          <Text style={ui.text}>{item.comment}</Text>
          {!!item.image && (
            <Image
              source={{ uri: item.image }}
              contentFit="cover"
              style={{ width: 180, height: 150, borderRadius: 12 }}
            />
          )}
        </View>
      ))}
      {!expanded && (result.data?.items.length || 0) > 3 && (
        <Action
          secondary
          title="Đọc thêm đánh giá"
          onPress={() => setExpanded(true)}
        />
      )}
      {expanded && (
        <View style={ui.row}>
          {page > 0 && (
            <Action
              secondary
              title="Trang trước"
              onPress={() => setPage(page - 1)}
            />
          )}
          {result.data?.hasMore && (
            <Action
              secondary
              title="Trang tiếp theo"
              onPress={() => setPage(page + 1)}
            />
          )}
        </View>
      )}
    </Card>
  );
}
export function RatingForm({ bookingId }: { bookingId: string }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState("");
  const [saved, setSaved] = useState(false);
  const action = useAction();
  async function choosePhoto() {
    const selection = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (selection.canceled) return;
    const asset = selection.assets[0];
    const context = ImageManipulator.manipulate(asset.uri);
    if (Math.max(asset.width, asset.height) > 800)
      context.resize(
        asset.width >= asset.height
          ? { width: 800, height: null }
          : { width: null, height: 800 },
      );
    const rendered = await context.renderAsync();
    const output = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: 0.65,
      base64: true,
    });
    if (!output.base64 || output.base64.length > 1_330_000)
      throw new Error("Ảnh quá lớn; vui lòng chọn ảnh khác.");
    setPhoto(`data:image/jpeg;base64,${output.base64}`);
  }
  return (
    <Card>
      <Text style={ui.heading}>Đánh giá sau trải nghiệm</Text>
      <Text style={ui.text}>
        Chỉ chủ đặt chỗ đã xác nhận và hoàn tất có thể đánh giá. Mỗi đặt chỗ
        được gửi một đánh giá; ảnh sẽ hiển thị công khai.
      </Text>
      {saved ? (
        <Text style={ui.text}>Cảm ơn bạn đã đánh giá.</Text>
      ) : (
        <>
          <View style={ui.row}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={`${value} sao`}
                accessibilityState={{ selected: value === stars }}
                onPress={() => setStars(value)}
              >
                <Text
                  style={{
                    fontSize: 30,
                    color: value <= stars ? "#f59e0b" : "#cbd5e1",
                  }}
                >
                  ★
                </Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="Cảm nhận của bạn"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={3000}
          />
          <Action
            secondary
            title={photo ? "Đổi ảnh" : "Thêm ảnh (không bắt buộc)"}
            disabled={action.busy}
            onPress={() => action.run(choosePhoto)}
          />
          {!!photo && (
            <>
              <Image
                source={{ uri: photo }}
                style={{ width: 160, height: 130, borderRadius: 12 }}
              />
              <Action secondary title="Xóa ảnh" onPress={() => setPhoto("")} />
            </>
          )}
          <ErrorText message={action.error} />
          <Action
            title="Gửi đánh giá"
            disabled={action.busy || !stars || !comment.trim()}
            onPress={() =>
              action.run(async () => {
                await api("/ratings", {
                  method: "POST",
                  body: { bookingId, stars, comment, image: photo || null },
                });
                setSaved(true);
              })
            }
          />
        </>
      )}
    </Card>
  );
}
