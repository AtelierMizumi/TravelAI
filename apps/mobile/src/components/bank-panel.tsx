import { useState } from "react";
import { Text } from "react-native";
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
import { api } from "@/services/api";
import { useResource } from "@/hooks/use-resource";
import type { Bank } from "@/services/types";
export function BankPanel({
  data,
  reload,
}: {
  data: Bank | null;
  reload: () => void;
}) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [testCvv, setTestCvv] = useState("");
  const [open, setOpen] = useState(false);
  const [linked, setLinked] = useState(false);
  const action = useAction();
  const banks = useResource<string[]>("/booking/bank/institutions");
  return (
    <>
      <Card>
        <Text style={ui.heading}>Liên kết ngân hàng SIMULATED</Text>
        <Text style={ui.text}>
          Chỉ liên kết tài khoản mô phỏng đã tồn tại. Không nhập tài khoản hoặc
          mã CVV thật. Không có chức năng nạp tiền.
        </Text>
        {data?.cards.map((card) => (
          <Text key={card.cardId} style={ui.text}>
            {card.bankName} · {card.cardId} · {card.status}
          </Text>
        ))}
        <Action
          secondary
          title={open ? "Đóng liên kết" : "Liên kết ngân hàng"}
          onPress={() => setOpen(!open)}
        />
        {open && (
          <>
            <Text style={ui.label}>Chọn ngân hàng SIMULATED</Text>
            <ErrorText message={banks.error} />
            {banks.data?.map((name) => (
              <Action
                key={name}
                secondary={name !== bankName}
                title={name}
                onPress={() => setBankName(name)}
              />
            ))}
            {banks.data?.length === 0 && (
              <Text style={ui.text}>
                Chưa có ngân hàng SIMULATED trong dữ liệu.
              </Text>
            )}
            <Field
              label="Số tài khoản SIMULATED (SIM-MC-…)"
              value={accountNumber}
              onChangeText={setAccountNumber}
              autoCapitalize="characters"
            />
            <Field
              label="Mã kiểm tra TEST-… SIMULATED"
              value={testCvv}
              onChangeText={setTestCvv}
              autoCapitalize="none"
              secureTextEntry
            />
            <ErrorText message={action.error} />
            <Action
              title="Xác nhận liên kết SIMULATED"
              disabled={
                action.busy ||
                !bankName ||
                !accountNumber.startsWith("SIM-MC-") ||
                !testCvv.startsWith("TEST-")
              }
              onPress={() =>
                action.run(async () => {
                  await api("/booking/bank/link", {
                    method: "POST",
                    body: { bankName, accountNumber, testCvv },
                  });
                  setTestCvv("");
                  setAccountNumber("");
                  setLinked(true);
                  setOpen(false);
                  reload();
                })
              }
            />
          </>
        )}
        {linked && (
          <Text style={ui.text}>Đã liên kết ngân hàng SIMULATED.</Text>
        )}
      </Card>
      <Card>
        <Text style={ui.heading}>Lịch sử thanh toán SIMULATED</Text>
        {!data?.paymentAttempts?.length && (
          <Text style={ui.text}>Chưa có lần thanh toán nào.</Text>
        )}
        {data?.paymentAttempts?.map((item) => (
          <Card key={item.id}>
            <Text style={ui.label}>
              {item.status === "SUCCEEDED" ? "Thành công" : "Thất bại"} ·{" "}
              {money(item.amount)}
            </Text>
            <Text style={ui.text}>
              {item.reason} · {serviceTime(item.createdAt)}
            </Text>
            {item.status === "FAILED" && (
              <Nav
                href={{
                  pathname: "/booking/payment",
                  params: { review: item.reviewId },
                }}
              >
                Kiểm tra và thanh toán lại →
              </Nav>
            )}
            {item.bookingId && (
              <Nav
                href={{
                  pathname: "/bookings/[id]",
                  params: { id: item.bookingId },
                }}
              >
                Xem chuyến đi →
              </Nav>
            )}
          </Card>
        ))}
      </Card>
    </>
  );
}
