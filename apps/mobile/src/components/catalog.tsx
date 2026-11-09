import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Card,
  ErrorText,
  Field,
  Nav,
  Screen,
  money,
  ui,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { provinceFor, provinces } from "@/services/provinces";
import type { CatalogItem } from "@/services/types";

export function Catalog({ kind }: { kind: "tours" | "hotels" }) {
  const resource = useResource<CatalogItem[]>(`/${kind}`);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [province, setProvince] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [area, setArea] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rating, setRating] = useState(0);
  const itemProvince = (item: CatalogItem) =>
    provinceFor(item.province || item.location);
  const areas = useMemo(
    () =>
      [
        ...new Set(
          (resource.data || [])
            .filter(
              (item) =>
                !province ||
                provinceFor(item.province || item.location) === province,
            )
            .flatMap((item) =>
              (item.location || "")
                .split(",")
                .map((v) => v.trim())
                .filter((v) => /^(quận|huyện|thị xã|phường|xã)\s/i.test(v)),
            ),
        ),
      ].sort((a, b) => a.localeCompare(b, "vi")),
    [resource.data, province],
  );
  const amount = maxPrice.trim() ? Number(maxPrice) : null;
  const invalidPrice =
    amount !== null && (!Number.isFinite(amount) || amount < 0);
  const matches = resource.data?.filter(
    (item) =>
      `${item.name} ${item.location || ""} ${item.province || ""}`
        .toLocaleLowerCase("vi")
        .includes(query.trim().toLocaleLowerCase("vi")) &&
      (!province || itemProvince(item) === province) &&
      (!area ||
        (item.location || "")
          .split(",")
          .some((part) => part.trim() === area)) &&
      (!rating || (item.rating != null && item.rating >= rating)) &&
      (amount === null ||
        (!invalidPrice && item.price != null && item.price <= amount)),
  );
  const groups =
    kind === "hotels"
      ? [
          ...new Set(
            matches?.map(
              (item) => itemProvince(item) || "Chưa xác định tỉnh/thành",
            ) || [],
          ),
        ].sort((a, b) => a.localeCompare(b, "vi"))
      : [""];
  return (
    <Screen title={kind === "tours" ? "Khám phá tour" : "Tìm khách sạn"}>
      <View style={styles.toolbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={searchOpen ? "Đóng tìm kiếm" : "Mở tìm kiếm"}
          accessibilityState={{ expanded: searchOpen }}
          onPress={() => setSearchOpen(!searchOpen)}
          style={styles.icon}
        >
          <Ionicons
            name={searchOpen ? "close" : "search"}
            size={23}
            color="#2563eb"
          />
        </Pressable>
        <Text style={styles.hint}>Tìm chuyến đi phù hợp với bạn</Text>
      </View>
      {searchOpen && (
        <Field
          label="Tìm theo tên hoặc địa điểm"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      )}
      {kind === "hotels" && (
        <Card>
          <Text style={ui.heading}>Bộ lọc khách sạn</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: provinceOpen }}
            onPress={() => setProvinceOpen(!provinceOpen)}
            style={styles.filterToggle}
          >
            <Ionicons name="location-outline" size={18} color="#2563eb" />
            <Text style={styles.filterText}>
              {province || "Tất cả tỉnh/thành"}
            </Text>
            <Ionicons
              name={provinceOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#2563eb"
            />
          </Pressable>
          {provinceOpen && (
            <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled>
              <View style={styles.chips}>
                {["", ...Object.keys(provinces)].map((value) => (
                  <Pressable
                    key={value || "all"}
                    accessibilityRole="button"
                    accessibilityState={{ selected: value === province }}
                    onPress={() => {
                      setProvince(value);
                      setArea("");
                      setProvinceOpen(false);
                    }}
                    style={[
                      styles.chip,
                      value === province && styles.chipSelected,
                    ]}
                  >
                    <Text style={styles.chipText}>{value || "Tất cả"}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
          {areas.length > 0 && (
            <>
              <Text style={ui.label}>Khu vực có trong địa chỉ</Text>
              <View style={styles.chips}>
                {["", ...areas].map((value) => (
                  <Pressable
                    key={value || "all"}
                    accessibilityRole="button"
                    accessibilityState={{ selected: value === area }}
                    onPress={() => setArea(value)}
                    style={[styles.chip, value === area && styles.chipSelected]}
                  >
                    <Text style={styles.chipText}>{value || "Tất cả"}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          <Field
            label="Giá danh mục tối đa · SIMULATED VND"
            keyboardType="numeric"
            value={maxPrice}
            onChangeText={setMaxPrice}
            placeholder="Không giới hạn"
          />
          <Text style={ui.label}>Điểm danh mục tối thiểu</Text>
          <View style={styles.chips}>
            {[0, 3, 4, 5].map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: value === rating }}
                onPress={() => setRating(value)}
                style={[styles.chip, value === rating && styles.chipSelected]}
              >
                <Text style={styles.chipText}>
                  {value ? `${value}+ ★` : "Tất cả"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>
            Giá và điểm là thông tin danh mục, không phải giá chốt theo lịch
            hoặc đánh giá đã xác minh. Khu vực phụ thuộc địa chỉ đã nhập.
          </Text>
          {invalidPrice && (
            <Text style={ui.error}>Vui lòng nhập mức giá hợp lệ.</Text>
          )}
        </Card>
      )}
      <ErrorText message={resource.error} />
      {resource.loading && <Text style={ui.text}>Đang tải…</Text>}
      {matches?.length === 0 && (
        <Text style={ui.text}>Chưa có dịch vụ phù hợp.</Text>
      )}
      {groups.map((group) => (
        <View key={group || "all"} style={{ gap: 14 }}>
          {!!group && <Text style={ui.heading}>{group}</Text>}
          <View style={[ui.row, { alignItems: "stretch" }]}>
            {matches
              ?.filter(
                (item) =>
                  !group ||
                  (itemProvince(item) || "Chưa xác định tỉnh/thành") === group,
              )
              .map((item) => (
                <View key={item.id} style={{ flexBasis: 320, flexGrow: 1 }}>
                  <Card>
                    {!!item.image && (
                      <Image
                        source={{ uri: item.image }}
                        contentFit="cover"
                        style={ui.image}
                      />
                    )}
                    <Nav
                      href={{
                        pathname:
                          kind === "tours"
                            ? "/booking/tours/[id]"
                            : "/booking/hotels/[id]",
                        params: { id: item.id },
                      }}
                    >
                      {item.name}
                    </Nav>
                    <Text style={ui.text}>{item.location}</Text>
                    {item.rating != null && (
                      <Text style={ui.text}>
                        Điểm danh mục: {item.rating} ★
                      </Text>
                    )}
                    {item.price != null && (
                      <Text style={styles.price}>
                        Giá tham khảo: {money(item.price)}
                      </Text>
                    )}
                    <Text style={styles.hint}>
                      Giá và chỗ trống được xác nhận khi chọn lịch.
                    </Text>
                  </Card>
                </View>
              ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}
const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    height: 46,
    width: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e7f0ff",
  },
  hint: { color: "#64748b", fontSize: 13, lineHeight: 20, flexShrink: 1 },
  filterToggle: { flexDirection: "row", alignItems: "center", gap: 8 },
  filterText: { color: "#2563eb", fontWeight: "700", flex: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#dce6f4",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#e5efff", borderColor: "#9dbdff" },
  chipText: { color: "#334155", fontSize: 13 },
  price: { color: "#1d4ed8", fontWeight: "700" },
});
