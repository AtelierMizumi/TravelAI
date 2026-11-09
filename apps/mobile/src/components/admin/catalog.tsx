import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Action, Card, ErrorText, Field, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { CatalogItem, Place } from "@/services/types";
import { provinces } from "@/services/provinces";
type Kind = "tours" | "hotels" | "places";
export function AdminCatalog({ kind }: { kind: Kind }) {
  const resource = useResource<(CatalogItem & Place)[]>(`/${kind}`);
  const [selected, setSelected] = useState<(CatalogItem & Place) | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <ErrorText message={resource.error} />
      <Action
        title="Thêm dịch vụ / điểm đến"
        onPress={() => {
          setSelected(null);
          setCreating(true);
        }}
      />
      {(creating || selected) && (
        <CatalogEditor
          key={selected?.id || "new"}
          kind={kind}
          item={selected}
          done={() => {
            setSelected(null);
            setCreating(false);
            resource.reload();
          }}
        />
      )}
      {resource.data?.map((item) => (
        <Card key={item.id}>
          <Text style={ui.heading}>{item.name}</Text>
          <Text style={ui.text}>
            ID {item.id} · {item.location} · {item.status}
          </Text>
          <Action
            secondary
            title="Sửa"
            onPress={() => {
              setSelected(item);
              setCreating(false);
            }}
          />
        </Card>
      ))}
    </>
  );
}
function CatalogEditor({
  kind,
  item,
  done,
}: {
  kind: Kind;
  item: (CatalogItem & Place) | null;
  done: () => void;
}) {
  const [name, setName] = useState(item?.name || "");
  const [location, setLocation] = useState(item?.location || "");
  const [province, setProvince] = useState(item?.province || "");
  const [choosingProvince, setChoosingProvince] = useState(false);
  const [description, setDescription] = useState(item?.description || "");
  const [image, setImage] = useState(item?.image || item?.imageUrl || "");
  const [price, setPrice] = useState(item ? String(item.price ?? "") : "");
  const [rating, setRating] = useState(item ? String(item.rating ?? "") : "");
  const [capacity, setCapacity] = useState(
    item
      ? String(kind === "hotels" ? (item.rooms ?? "") : (item.maxGuests ?? ""))
      : "",
  );
  const [duration, setDuration] = useState(
    item ? String(item.durationDays ?? "") : "",
  );
  const [status, setStatus] = useState(item?.status || "active");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const action = useAction();
  return (
    <Card>
      <Field label="Tên" value={name} onChangeText={setName} />
      {kind !== "places" && (
        <>
          <Field label="Địa điểm" value={location} onChangeText={setLocation} />
          {kind === "hotels" && (
            <>
              <Action
                secondary
                title={
                  province
                    ? `Tỉnh/thành: ${province}`
                    : "Chọn tỉnh/thành hiện tại"
                }
                onPress={() => setChoosingProvince(!choosingProvince)}
              />
              {choosingProvince && (
                <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled>
                  <View style={ui.row}>
                    {["", ...Object.keys(provinces)].map((value) => (
                      <Pressable
                        accessibilityRole="button"
                        key={value || "none"}
                        onPress={() => {
                          setProvince(value);
                          setChoosingProvince(false);
                        }}
                        style={{ padding: 10 }}
                      >
                        <Text style={ui.link}>{value || "Chưa xác định"}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
            </>
          )}
          <Field
            label="Giá danh mục SIMULATED VND"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
          <Field
            label="Đánh giá"
            keyboardType="numeric"
            value={rating}
            onChangeText={setRating}
          />
          <Field
            label={
              kind === "hotels" ? "Số phòng trong danh mục" : "Số khách tối đa"
            }
            keyboardType="number-pad"
            value={capacity}
            onChangeText={setCapacity}
          />
          {kind === "tours" && (
            <Field
              label="Thời lượng ngày"
              keyboardType="number-pad"
              value={duration}
              onChangeText={setDuration}
            />
          )}
          <Field label="Trạng thái" value={status} onChangeText={setStatus} />
        </>
      )}
      <Field
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Field
        label="URL ảnh"
        value={image}
        onChangeText={setImage}
        autoCapitalize="none"
      />
      <Text style={ui.text}>
        Lịch bán và phòng/ghế thực tế được cấu hình riêng trong mục Chính sách
        và tồn chỗ, liên kết bằng ID danh mục này.
      </Text>
      <ErrorText message={action.error} />
      <Action
        title="Lưu"
        disabled={action.busy || !name.trim()}
        onPress={() =>
          action.run(async () => {
            const body =
              kind === "places"
                ? { name, description, imageUrl: image }
                : {
                    name,
                    location,
                    ...(kind === "hotels" ? { province } : {}),
                    description,
                    image,
                    price: Number(price),
                    rating: Number(rating),
                    rooms: Number(capacity),
                    maxGuests: Number(capacity),
                    durationDays: Number(duration),
                    status,
                  };
            await api(item ? `/${kind}/${item.id}` : `/${kind}`, {
              method: item ? "PUT" : "POST",
              body,
            });
            done();
          })
        }
      />
      {item && (
        <Action
          secondary
          title={confirmDelete ? "Xác nhận xóa" : "Xóa"}
          disabled={action.busy}
          onPress={() =>
            confirmDelete
              ? action.run(async () => {
                  await api(`/${kind}/${item.id}`, { method: "DELETE" });
                  done();
                })
              : setConfirmDelete(true)
          }
        />
      )}
      <Action secondary title="Đóng" onPress={done} />
    </Card>
  );
}
