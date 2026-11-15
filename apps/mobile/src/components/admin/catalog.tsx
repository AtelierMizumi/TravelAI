import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { AdminButton, adminList } from "@/components/admin/list-ui";
import { Action, Card, ErrorText, Field, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { CatalogItem, Place } from "@/services/types";
import { provinceFor, provinces } from "@/services/provinces";
import { adminCatalogPath, catalogProvinces, filterCatalog } from "@/services/admin-catalog";
import { prepareWebImageDataUrl } from "@/services/webImage";
type Kind = "tours" | "hotels" | "places";
const labels = { tours: "tour", hotels: "khách sạn", places: "địa điểm" } as const;
const icons = { tours: "compass-outline", hotels: "bed-outline", places: "location-outline" } as const;
export function AdminCatalog({ kind }: { kind: Kind }) {
  const resource = useResource<(CatalogItem & Place)[]>(adminCatalogPath(kind));
  const [selected, setSelected] = useState<(CatalogItem & Place) | null>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [showProvinces, setShowProvinces] = useState(false);
  const [status, setStatus] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const toggle = useAction();
  const items = resource.data || [];
  const priceText = maxPrice.trim();
  const priceValid = !priceText || (Number.isFinite(Number(priceText)) && Number(priceText) >= 0);
  const filtered = filterCatalog(
    items,
    { search, province, status, maxPrice: priceText && priceValid ? Number(priceText) : undefined, minRating },
    provinceFor,
  );
  const isPlace = kind === "places";
  return (
    <>
      <ErrorText message={resource.error || toggle.error} />
      <View style={{ alignItems: "flex-start" }}>
        <AdminButton title={`Thêm ${labels[kind]}`} icon="add-outline" tone="primary" onPress={() => { setSelected(null); setCreating(true); }} />
      </View>
      {(creating || selected) && (
        <CatalogEditor
          key={selected?.id || "new"}
          kind={kind}
          item={selected}
          done={() => { setSelected(null); setCreating(false); resource.reload(); }}
        />
      )}
      <View style={adminList.panel}>
        <View style={adminList.header}>
          <View>
            <Text style={adminList.title}>Danh sách {labels[kind]}</Text>
            <Text style={adminList.hint}>{filtered.length}/{items.length} kết quả</Text>
          </View>
          <View style={{ minWidth: 220, flexGrow: 1, maxWidth: 360 }}>
            <Field label="Tìm theo tên, địa điểm hoặc tỉnh" value={search} onChangeText={setSearch} autoCapitalize="none" />
          </View>
        </View>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={ui.row}>
            <AdminButton title={province || "Tất cả tỉnh/thành"} icon="location-outline" onPress={() => setShowProvinces(!showProvinces)} />
            {!!province && <AdminButton title="Xóa tỉnh" icon="close-outline" onPress={() => setProvince("")} />}
            {!isPlace && (
              <>
                {([["", "Mọi trạng thái"], ["active", "Đang bán"], ["inactive", "Đã tắt"]] as const).map(([value, label]) => (
                  <AdminButton key={value || "all"} title={label} icon={status === value ? "checkmark-circle-outline" : "ellipse-outline"} tone={status === value ? "primary" : "soft"} onPress={() => setStatus(value)} />
                ))}
              </>
            )}
          </View>
          {showProvinces && (
            <ScrollView nestedScrollEnabled style={{ maxHeight: 150 }}>
              <View style={ui.row}>
                {catalogProvinces(items, provinceFor).map((value) => (
                  <Pressable key={value} accessibilityRole="button" onPress={() => { setProvince(value); setShowProvinces(false); }} style={{ padding: 8 }}>
                    <Text style={ui.link}>{value}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
          {!isPlace && (
            <View style={ui.row}>
              <View style={{ minWidth: 200, flexGrow: 1, maxWidth: 280 }}>
                <Field label="Giá tối đa · SIMULATED VND" value={maxPrice} onChangeText={setMaxPrice} keyboardType="numeric" />
              </View>
              {[0, 3, 4, 4.5].map((value) => (
                <AdminButton key={value} title={value ? `Điểm ≥ ${value}` : "Mọi điểm"} icon="star-outline" tone={minRating === value ? "primary" : "soft"} onPress={() => setMinRating(value)} />
              ))}
            </View>
          )}
          {!priceValid && <Text style={ui.error}>Giá tối đa phải là số không âm.</Text>}
        </View>
        {resource.loading && !resource.data && <Text style={adminList.empty}>Đang tải dữ liệu…</Text>}
        {!resource.loading && !resource.error && !filtered.length && (
          <Text style={adminList.empty}>{items.length ? "Không có kết quả phù hợp bộ lọc." : "Chưa có dữ liệu."}</Text>
        )}
        {filtered.map((item) => {
          const image = item.image || item.imageUrl;
          const active = isPlace || item.status === "active";
          return (
            <View key={item.id} style={adminList.row}>
              {image ? <Image source={{ uri: image }} style={{ width: 48, height: 48, borderRadius: 12 }} contentFit="cover" /> : <View style={adminList.avatar}><Ionicons name={icons[kind]} size={20} color="#3457df" /></View>}
              <View style={adminList.body}>
                <Text style={adminList.name}>{item.name}</Text>
                <Text style={adminList.sub}>
                  {[item.location, provinceFor(item.province || item.location), !isPlace && typeof item.price === "number" ? `${item.price.toLocaleString("vi-VN")} VND (SIMULATED)` : null, !isPlace && typeof item.rating === "number" ? `★ ${item.rating}` : null].filter(Boolean).join(" · ") || "Chưa có thông tin"}
                </Text>
                {!isPlace && <View style={adminList.badge}><Text style={adminList.badgeText}>{active ? "Đang bán" : "Đã tắt"}</Text></View>}
              </View>
              <View style={adminList.actions}>
                {!isPlace && (
                  <AdminButton
                    title={active ? "Tắt" : "Bật"}
                    icon={active ? "pause-outline" : "play-outline"}
                    disabled={toggle.busy}
                    onPress={() => toggle.run(async () => {
                      await api(`/${kind}/${item.id}`, { method: "PUT", body: { ...item, status: active ? "inactive" : "active" } });
                      resource.reload();
                    })}
                  />
                )}
                <AdminButton title="Sửa" icon="create-outline" onPress={() => { setSelected(item); setCreating(false); }} />
              </View>
            </View>
          );
        })}
      </View>
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
          <View style={ui.row}>
            {([["active", "Đang bán"], ["inactive", "Đã tắt"]] as const).map(([value, label]) => (
              <AdminButton key={value} title={label} icon={status === value ? "checkmark-circle-outline" : "ellipse-outline"} tone={status === value ? "primary" : "soft"} onPress={() => setStatus(value)} />
            ))}
          </View>
        </>
      )}
      <Field
        label="Mô tả"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {!!image && <Image source={{ uri: image }} style={{ width: 160, height: 100, borderRadius: 12 }} contentFit="cover" />}
      <View style={ui.row}>
        <AdminButton
          title="Chọn ảnh từ thiết bị"
          icon="image-outline"
          disabled={action.busy}
          onPress={() => action.run(async () => {
            const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
            if (picked.canceled) return;
            const asset = picked.assets[0];
            if (Platform.OS === "web") {
              setImage(await prepareWebImageDataUrl(asset.uri));
              return;
            }
            const context = ImageManipulator.manipulate(asset.uri);
            context.resize(asset.width >= asset.height ? { width: 800 } : { height: 800 });
            const rendered = await context.renderAsync();
            const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.7, base64: true });
            setImage(`data:image/jpeg;base64,${saved.base64}`);
          })}
        />
        {!!image && <AdminButton title="Bỏ ảnh" icon="trash-outline" onPress={() => setImage("")} />}
      </View>
      <Field label="Hoặc dán URL ảnh" value={image.startsWith("data:") ? "" : image} onChangeText={setImage} autoCapitalize="none" />
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
