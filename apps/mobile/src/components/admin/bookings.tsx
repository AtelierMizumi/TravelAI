import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AdminButton, adminList } from "@/components/admin/list-ui";
import { dateParts, filterRows, groupRows, type BookingFilters, type BookingGroup, type BookingRow } from "@/services/admin-bookings";
import { provinceFor } from "@/services/provinces";
import {
  Action,
  Card,
  ErrorText,
  Field,
  money,
  Nav,
  serviceTime,
  ui,
  useAction,
} from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api, operationKey } from "@/services/api";
import type { Booking, CatalogItem, Offer, User } from "@/services/types";
type LegacyBooking = { id: number; userId?: number; userName?: string; tourName?: string; hotelName?: string; bookingDate?: string; checkIn?: string; status?: string };
const kindLabel = { TOUR: "Tour", HOTEL: "Khách sạn" } as const;
const statuses = ["CONFIRMED", "CANCELLED", "NO_SHOW"];
export function AdminBookings() {
  const resource = useResource<Booking[]>("/booking/bookings");
  const legacyTours = useResource<LegacyBooking[]>("/tour-bookings");
  const legacyHotels = useResource<LegacyBooking[]>("/hotel-bookings");
  const offers = useResource<Offer[]>("/booking/admin/offers");
  const tours = useResource<CatalogItem[]>("/admin/catalog/tours");
  const hotels = useResource<CatalogItem[]>("/admin/catalog/hotels");
  const users = useResource<User[]>("/users");
  const [kind, setKind] = useState<"TOUR" | "HOTEL">("TOUR");
  const [filters, setFilters] = useState<BookingFilters>({});
  const [showProvinces, setShowProvinces] = useState(false);
  const [open, setOpen] = useState("");
  const [selected, setSelected] = useState("");
  const patch = (change: BookingFilters) => setFilters((current) => ({ ...current, ...change }));
  const rows: BookingRow[] = [];
  for (const booking of resource.data || []) {
    const itinerary = booking.itinerary;
    if (!itinerary || (itinerary.kind !== "TOUR" && itinerary.kind !== "HOTEL")) continue;
    const offer = offers.data?.find((item) => item.id === itinerary.selection.offeringId && item.kind === itinerary.kind);
    const catalog = (itinerary.kind === "TOUR" ? tours.data : hotels.data)?.find((item) => item.id === offer?.legacyId);
    const owner = users.data?.find((item) => item.id === booking.ownerId);
    rows.push({
      key: booking.id,
      group: `offer:${itinerary.selection.offeringId}`,
      name: itinerary.name,
      kind: itinerary.kind,
      province: provinceFor(catalog?.province || catalog?.location) || "",
      ...dateParts(itinerary.start),
      customer: owner?.name || `Khách #${booking.ownerId}`,
      status: booking.status,
    });
  }
  const legacy: BookingRow[] = (["TOUR", "HOTEL"] as const).flatMap((type) =>
    ((type === "TOUR" ? legacyTours.data : legacyHotels.data) || []).map((item) => {
      const name = (type === "TOUR" ? item.tourName : item.hotelName) || "Chưa xác định dịch vụ";
      return {
        key: `legacy:${type}:${item.id}`,
        group: `legacy:${type}:${name}`,
        name,
        kind: type,
        province: "",
        ...dateParts(type === "TOUR" ? item.bookingDate : item.checkIn),
        customer: item.userName || (item.userId ? `Khách #${item.userId}` : "Chưa có tên"),
        status: item.status || "Chưa rõ",
      };
    }),
  );
  const provincesInData = [...new Set(rows.map((row) => row.province).filter(Boolean))].sort((x, y) => x.localeCompare(y, "vi"));
  const current = groupRows(filterRows(rows.filter((row) => row.kind === kind), filters));
  const old = groupRows(filterRows(legacy.filter((row) => row.kind === kind), filters));
  const loading = resource.loading || offers.loading || users.loading;
  const reload = () => { resource.reload(); offers.reload(); };
  const renderGroups = (groups: BookingGroup[], isLegacy: boolean) =>
    groups.map((group) => (
      <View key={group.group}>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: open === group.group }} onPress={() => setOpen(open === group.group ? "" : group.group)} style={adminList.row}>
          <View style={adminList.body}>
            <Text style={adminList.name}>{group.name}</Text>
            <Text style={adminList.sub}>{group.rows.length} đặt chỗ · {kindLabel[group.kind]}</Text>
          </View>
          <Ionicons name={open === group.group ? "chevron-up" : "chevron-down"} size={18} color="#64748b" />
        </Pressable>
        {open === group.group &&
          group.rows.map((row) => {
            const booking = isLegacy ? undefined : resource.data?.find((item) => item.id === row.key);
            return (
              <View key={row.key} style={[adminList.row, { backgroundColor: "#f8fafc" }]}>
                <View style={adminList.body}>
                  <Text style={adminList.name}>{row.customer}</Text>
                  <Text style={adminList.sub}>
                    {[row.date || "Chưa có ngày", row.time, row.province || "Chưa rõ tỉnh/thành", row.status].filter(Boolean).join(" · ")}
                  </Text>
                  {!isLegacy && <Text selectable style={adminList.sub}>Mã {row.key}</Text>}
                </View>
                {booking && <AdminButton title={selected === row.key ? "Đóng" : "Xử lý"} icon="construct-outline" onPress={() => setSelected(selected === row.key ? "" : row.key)} />}
                {booking && selected === row.key && <View style={{ width: "100%" }}><BookingActions key={`${booking.id}/${booking.revision}`} booking={booking} reload={reload} /></View>}
              </View>
            );
          })}
      </View>
    ));
  return (
    <>
      <ErrorText message={resource.error || legacyTours.error || legacyHotels.error || offers.error || users.error} />
      <View style={ui.row}>
        {(["TOUR", "HOTEL"] as const).map((value) => (
          <AdminButton key={value} title={kindLabel[value]} icon={value === "TOUR" ? "compass-outline" : "bed-outline"} tone={kind === value ? "primary" : "soft"} onPress={() => { setKind(value); setOpen(""); }} />
        ))}
      </View>
      <View style={adminList.panel}>
        <View style={{ padding: 16, gap: 12 }}>
          <Field label="Tìm theo dịch vụ, tên khách hoặc mã" value={filters.query || ""} onChangeText={(query) => patch({ query })} autoCapitalize="none" />
          <View style={ui.row}>
            <AdminButton title={filters.province || "Tất cả tỉnh/thành"} icon="location-outline" onPress={() => setShowProvinces(!showProvinces)} />
            {!!filters.province && <AdminButton title="Xóa tỉnh" icon="close-outline" onPress={() => patch({ province: "" })} />}
            {["", ...statuses].map((value) => (
              <AdminButton key={value || "all"} title={value || "Mọi trạng thái"} icon="flag-outline" tone={(filters.status || "") === value ? "primary" : "soft"} onPress={() => patch({ status: value })} />
            ))}
          </View>
          {showProvinces && (
            <View style={ui.row}>
              {provincesInData.map((value) => (
                <Pressable key={value} accessibilityRole="button" onPress={() => { patch({ province: value }); setShowProvinces(false); }} style={{ padding: 8 }}><Text style={ui.link}>{value}</Text></Pressable>
              ))}
            </View>
          )}
          <View style={ui.row}>
            <View style={{ minWidth: 150, flexGrow: 1 }}><Field label="Từ ngày (YYYY-MM-DD)" value={filters.from || ""} onChangeText={(from) => patch({ from })} autoCapitalize="none" /></View>
            <View style={{ minWidth: 150, flexGrow: 1 }}><Field label="Đến ngày (YYYY-MM-DD)" value={filters.to || ""} onChangeText={(to) => patch({ to })} autoCapitalize="none" /></View>
            <View style={{ minWidth: 110, flexGrow: 1 }}><Field label="Từ giờ (HH:mm)" value={filters.timeFrom || ""} onChangeText={(timeFrom) => patch({ timeFrom })} autoCapitalize="none" /></View>
            <View style={{ minWidth: 110, flexGrow: 1 }}><Field label="Đến giờ (HH:mm)" value={filters.timeTo || ""} onChangeText={(timeTo) => patch({ timeTo })} autoCapitalize="none" /></View>
          </View>
          <Text style={adminList.hint}>Ngày và giờ theo múi giờ Asia/Ho_Chi_Minh. Khi đang lọc theo trường nào, hồ sơ thiếu trường đó sẽ không hiển thị.</Text>
        </View>
        <View style={adminList.header}><Text style={adminList.title}>Đặt chỗ hiện tại · {kindLabel[kind]}</Text></View>
        {loading && !resource.data && <Text style={adminList.empty}>Đang tải dữ liệu…</Text>}
        {!loading && !current.length && <Text style={adminList.empty}>Không có đặt chỗ phù hợp.</Text>}
        {renderGroups(current, false)}
        {!!(legacy.length) && (
          <>
            <View style={adminList.header}><View><Text style={adminList.title}>Hồ sơ cũ · {kindLabel[kind]}</Text><Text style={adminList.hint}>Giữ riêng, không gộp với đặt chỗ hiện tại vì không có khóa liên kết đáng tin cậy.</Text></View></View>
            {!old.length && <Text style={adminList.empty}>Không có hồ sơ cũ phù hợp.</Text>}
            {renderGroups(old, true)}
          </>
        )}
      </View>
    </>
  );
}
function BookingActions({
  booking,
  reload,
}: {
  booking: Booking;
  reload: () => void;
}) {
  const [reason, setReason] = useState("");
  const [release, setRelease] = useState("");
  const [confirm, setConfirm] = useState("");
  const action = useAction();
  const attempt = useRef<{ payload: string; key: string } | null>(null);
  async function mutate(operation: string, body: unknown) {
    const payload = JSON.stringify({ operation, body });
    if (!attempt.current || attempt.current.payload !== payload)
      attempt.current = { payload, key: operationKey() };
    await api(`/booking/bookings/${booking.id}/${operation}`, {
      method: "POST",
      body,
      key: attempt.current.key,
    });
    reload();
  }
  return (
    <Card>
      <Text style={ui.heading}>
        {booking.itinerary.name} · {booking.status}
      </Text>
      <Text style={ui.text}>
        Khách #{booking.ownerId} · {serviceTime(booking.itinerary.start)} ·{" "}
        {money(booking.totalPaid)}
      </Text>
      <Nav href={{ pathname: "/bookings/[id]", params: { id: booking.id } }}>
        Chi tiết và lịch sử
      </Nav>
      <Field
        label="Lý do xử lý"
        multiline
        value={reason}
        onChangeText={setReason}
      />
      <Field
        label="Nhập ID đặt chỗ để xác nhận thao tác"
        value={confirm}
        onChangeText={setConfirm}
        autoCapitalize="none"
      />
      <Text selectable style={ui.text}>
        {booking.id}
      </Text>
      <ErrorText message={action.error} />
      {booking.status === "CONFIRMED" && (
        <>
          <Action
            secondary
            title="Hủy do không cung cấp dịch vụ, hoàn 100% SIMULATED"
            disabled={action.busy || !reason.trim() || confirm !== booking.id}
            onPress={() =>
              action.run(() =>
                mutate("cancel", {
                  reason: "SERVICE_UNAVAILABLE",
                  description: reason,
                }),
              )
            }
          />
          <Text selectable style={ui.text}>
            Phân bổ hiện tại{" "}
            {JSON.stringify(booking.itinerary.resources || [], null, 2)}
          </Text>
          <Field
            label="Resource key tương lai có thể bán lại, mỗi key một dòng (để trống để giữ phân bổ)"
            multiline
            value={release}
            onChangeText={setRelease}
          />
          <Action
            secondary
            title="Ghi nhận no-show, hoàn 0 SIMULATED"
            disabled={action.busy || !reason.trim() || confirm !== booking.id}
            onPress={() =>
              action.run(() =>
                mutate("no-show", {
                  reason,
                  releaseResources: release
                    .split("\n")
                    .map((value) => value.trim())
                    .filter(Boolean),
                }),
              )
            }
          />
        </>
      )}
      {booking.status === "NO_SHOW" && (
        <Action
          title="Sửa no-show, khôi phục đủ chỗ"
          disabled={action.busy || !reason.trim() || confirm !== booking.id}
          onPress={() =>
            action.run(() => mutate("correct-no-show", { reason }))
          }
        />
      )}
    </Card>
  );
}
