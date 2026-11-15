import { useState } from "react";
import { Text } from "react-native";
import { Action, Card, ErrorText, Field, ui, useAction } from "@/components/ui";
import { api } from "@/services/api";
export function AdminBank() {
  const [card, setCard] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [message, setMessage] = useState("");
  const action = useAction();
  return (
    <Card>
      <Text style={ui.heading}>Ngân hàng SIMULATED</Text>
      <Text style={ui.text}>
        Tài khoản mô phỏng phải có sẵn trong dữ liệu ngân hàng. Người dùng liên
        kết bằng mã SIM-MC-… và TEST-…. Không có chức năng nạp tiền trong ứng
        dụng.
      </Text>
      <Field
        label="Mã tài khoản SIM-MC-…"
        value={card}
        onChangeText={setCard}
        autoCapitalize="characters"
      />
      <Field
        label="Trạng thái ACTIVE / LOCKED / SUSPENDED / CLOSED"
        value={status}
        onChangeText={setStatus}
        autoCapitalize="characters"
      />
      <ErrorText message={action.error} />
      {!!message && <Text style={ui.text}>{message}</Text>}
      <Action
        title="Cập nhật trạng thái SIMULATED"
        disabled={action.busy || !card.startsWith("SIM-MC-")}
        onPress={() =>
          action.run(async () => {
            await api(`/booking/bank/cards/${encodeURIComponent(card)}`, {
              method: "PUT",
              body: { status },
            });
            setMessage("Đã cập nhật trạng thái SIMULATED.");
          })
        }
      />
    </Card>
  );
}
