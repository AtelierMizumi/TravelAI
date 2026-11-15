import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { Action, Card, ErrorText, Field, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Offer } from "@/services/types";
export function AdminPolicies() {
  const offers = useResource<Offer[]>("/booking/admin/offers");
  const [selected, setSelected] = useState<Offer | null>(null);
  const [editing, setEditing] = useState(false);
  return (
    <>
      <ErrorText message={offers.error} />
      <Action
        title="Cấu hình lịch bán mới"
        onPress={() => {
          setSelected(null);
          setEditing(true);
        }}
      />
      {editing && (
        <PolicyEditor
          key={selected?.id || "new"}
          offer={selected}
          done={() => {
            setEditing(false);
            offers.reload();
          }}
        />
      )}
      {offers.data?.map((offer) => (
        <Card key={offer.id}>
          <Text style={ui.heading}>
            {offer.name} · {offer.kind}
          </Text>
          <Text style={ui.text}>
            ID danh mục {offer.legacyId} ·{" "}
            {offer.active ? "Đang bán" : "Tạm dừng"} · phiên bản {offer.version}
          </Text>
          <Action
            secondary
            title="Sửa lịch bán và chính sách"
            onPress={() => {
              setSelected(offer);
              setEditing(true);
            }}
          />
        </Card>
      ))}
    </>
  );
}
function PolicyEditor({
  offer,
  done,
}: {
  offer: Offer | null;
  done: () => void;
}) {
  const [kind, setKind] = useState<"TOUR" | "HOTEL">(offer?.kind || "TOUR");
  const [name, setName] = useState(offer?.name || "");
  const [legacyId, setLegacyId] = useState(
    offer?.legacyId ? String(offer.legacyId) : "",
  );
  const [active, setActive] = useState(offer?.active ?? false);
  const [cancel, setCancel] = useState(
    offer ? String(offer.policy.cancellationHours) : "",
  );
  const [change, setChange] = useState(
    offer ? String(offer.policy.reschedulingHours) : "",
  );
  const [holiday, setHoliday] = useState(
    offer?.policy.holidayReschedulingHours == null
      ? ""
      : String(offer.policy.holidayReschedulingHours),
  );
  const [grace, setGrace] = useState(
    offer ? String(offer.policy.graceMinutes) : "",
  );
  const [hold, setHold] = useState(
    offer ? String(offer.policy.holdMinutes) : "",
  );
  const [checkIn, setCheckIn] = useState(offer?.checkInTime || "");
  const [checkOut, setCheckOut] = useState(offer?.checkOutTime || "");
  const [departures, setDepartures] = useState(
    JSON.stringify(offer?.departures || [], null, 2),
  );
  const [rooms, setRooms] = useState(
    JSON.stringify(offer?.rooms || [], null, 2),
  );
  const [promotionFrom, setPromotionFrom] = useState(
    offer?.promotion?.from || "",
  );
  const [promotionThrough, setPromotionThrough] = useState(
    offer?.promotion?.through || "",
  );
  const [promotionPercent, setPromotionPercent] = useState(
    offer?.promotion ? String(offer.promotion.percent) : "",
  );
  const action = useAction();
  return (
    <Card>
      <Text style={ui.heading}>Chính sách và tồn chỗ</Text>
      <View style={ui.row}>
        <Action
          title="TOUR"
          secondary={kind !== "TOUR"}
          onPress={() => setKind("TOUR")}
        />
        <Action
          title="HOTEL"
          secondary={kind !== "HOTEL"}
          onPress={() => setKind("HOTEL")}
        />
      </View>
      <Field label="Tên dịch vụ" value={name} onChangeText={setName} />
      <Text style={ui.heading}>Ưu đãi theo ngày sử dụng</Text>
      <Text style={ui.text}>
        Tùy chọn: giảm theo ngày khởi hành hoặc từng đêm lưu trú, bao gồm các
        ngày gần hoặc trong lễ do bạn cấu hình. Để trống cả ba ô để tắt.
      </Text>
      <Field
        label="Từ ngày YYYY-MM-DD"
        value={promotionFrom}
        onChangeText={setPromotionFrom}
      />
      <Field
        label="Đến ngày YYYY-MM-DD"
        value={promotionThrough}
        onChangeText={setPromotionThrough}
      />
      <Field
        label="Giảm phần trăm (1–100)"
        value={promotionPercent}
        onChangeText={setPromotionPercent}
        keyboardType="number-pad"
      />
      <Field
        label="ID tour/hotel trong danh mục"
        keyboardType="number-pad"
        value={legacyId}
        onChangeText={setLegacyId}
      />
      <Field
        label="Hạn hủy, số giờ nguyên ≥ 0"
        keyboardType="number-pad"
        value={cancel}
        onChangeText={setCancel}
      />
      <Field
        label="Hạn đổi lịch, số giờ nguyên ≥ 0"
        keyboardType="number-pad"
        value={change}
        onChangeText={setChange}
      />
      <Field
        label="Hạn đổi lịch ngày lễ, giờ nguyên (trống để dùng hạn chung)"
        keyboardType="number-pad"
        value={holiday}
        onChangeText={setHoliday}
      />
      <Field
        label="Ân hạn no-show, phút nguyên ≥ 0"
        keyboardType="number-pad"
        value={grace}
        onChangeText={setGrace}
      />
      <Field
        label="Thời gian giữ chỗ, phút nguyên ≥ 1"
        keyboardType="number-pad"
        value={hold}
        onChangeText={setHold}
      />
      {kind === "TOUR" ? (
        <>
          <Text style={ui.text}>
            Danh sách JSON các lượt khởi hành. Mỗi lượt gồm start (ISO-8601 có
            múi giờ), end (giờ kết thúc thực tế, ISO-8601 có múi giờ), capacity,
            seats (mảng ghế hoặc rỗng), price (SIMULATED VND/khách). Lịch không
            có end chưa đủ thông tin để xác minh hoàn tất và nhận đánh giá.
          </Text>
          <Field
            label="Lượt khởi hành JSON"
            value={departures}
            onChangeText={setDepartures}
            multiline
            style={{ minHeight: 160 }}
          />
        </>
      ) : (
        <>
          <Field
            label="Giờ nhận phòng HH:mm:ss (Việt Nam)"
            value={checkIn}
            onChangeText={setCheckIn}
          />
          <Field
            label="Giờ trả phòng HH:mm:ss (Việt Nam)"
            value={checkOut}
            onChangeText={setCheckOut}
          />
          <Text style={ui.text}>
            Danh sách JSON các phòng vật lý. Mỗi phòng gồm id, number,
            maxGuests, price (SIMULATED VND/đêm), nightlyPrices (giá từng ngày
            YYYY-MM-DD nếu có).
          </Text>
          <Field
            label="Phòng vật lý JSON"
            value={rooms}
            onChangeText={setRooms}
            multiline
            style={{ minHeight: 160 }}
          />
        </>
      )}
      <View style={ui.row}>
        <Switch
          value={active}
          onValueChange={setActive}
          accessibilityLabel="Mở bán"
        />
        <Text style={ui.text}>Mở bán sau khi đủ cấu hình</Text>
      </View>
      <ErrorText message={action.error} />
      <Action
        title="Lưu phiên bản chính sách mới"
        disabled={
          action.busy ||
          !name ||
          !legacyId ||
          cancel === "" ||
          change === "" ||
          grace === "" ||
          hold === "" ||
          ((!!promotionFrom || !!promotionThrough || !!promotionPercent) &&
            (!promotionFrom || !promotionThrough || !promotionPercent))
        }
        onPress={() =>
          action.run(async () => {
            await api("/booking/offers", {
              method: "POST",
              body: {
                id: offer?.id,
                kind,
                name,
                legacyId: Number(legacyId),
                active,
                policy: {
                  cancellationHours: Number(cancel),
                  reschedulingHours: Number(change),
                  holidayReschedulingHours:
                    holiday === "" ? null : Number(holiday),
                  graceMinutes: Number(grace),
                  holdMinutes: Number(hold),
                },
                checkInTime: kind === "HOTEL" ? checkIn : null,
                checkOutTime: kind === "HOTEL" ? checkOut : null,
                departures: kind === "TOUR" ? JSON.parse(departures) : [],
                rooms: kind === "HOTEL" ? JSON.parse(rooms) : [],
                promotion:
                  promotionFrom && promotionThrough && promotionPercent
                    ? {
                        from: promotionFrom,
                        through: promotionThrough,
                        percent: Number(promotionPercent),
                      }
                    : null,
              },
            });
            done();
          })
        }
      />
      <Action secondary title="Đóng" onPress={done} />
    </Card>
  );
}
export function AdminCalendar() {
  const [year, setYear] = useState("");
  const [source, setSource] = useState("");
  const [dates, setDates] = useState("");
  const [approved, setApproved] = useState(false);
  const [saved, setSaved] = useState("");
  const action = useAction();
  return (
    <Card>
      <Text style={ui.heading}>Lịch ngày lễ Việt Nam theo năm</Text>
      <Text style={ui.text}>
        Nhập ngày chính thức gồm Tết âm lịch và các bố trí nghỉ lễ được công bố
        áp dụng. Mỗi lần lưu tạo một phiên bản mới.
      </Text>
      <Field
        label="Năm"
        keyboardType="number-pad"
        value={year}
        onChangeText={setYear}
      />
      <Field
        label="Nguồn công bố chính thức"
        value={source}
        onChangeText={setSource}
      />
      <Field
        label="Ngày lễ YYYY-MM-DD, mỗi ngày một dòng"
        multiline
        value={dates}
        onChangeText={setDates}
        style={{ minHeight: 140 }}
      />
      <View style={ui.row}>
        <Switch
          value={approved}
          onValueChange={setApproved}
          accessibilityLabel="Phê duyệt lịch ngày lễ"
        />
        <Text style={ui.text}>Xác nhận đã kiểm tra và phê duyệt</Text>
      </View>
      <ErrorText message={action.error} />
      {!!saved && (
        <Text selectable style={ui.text}>
          {saved}
        </Text>
      )}
      <Action
        title="Lưu phiên bản lịch"
        disabled={action.busy || !year || !source || !approved}
        onPress={() =>
          action.run(async () => {
            const result = await api("/booking/calendars", {
              method: "POST",
              body: {
                year: Number(year),
                source,
                holidays: dates.split(/\s+/).filter(Boolean),
                approved,
              },
            });
            setSaved(JSON.stringify(result));
          })
        }
      />
    </Card>
  );
}
