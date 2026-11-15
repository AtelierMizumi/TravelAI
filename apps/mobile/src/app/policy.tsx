import { Text } from "react-native";
import { Card, Screen, ui } from "@/components/ui";
export default function Policy() {
  return (
    <Screen title="Chính sách đặt chỗ SIMULATED">
      <Card>
        <Text style={ui.heading}>Trước khi thanh toán</Text>
        <Text style={ui.text}>
          Bạn cần xem và xác nhận dịch vụ, thời gian, số khách, ghế hoặc phòng,
          tổng tiền và chính sách. Tất cả thanh toán, số dư và hoàn tiền đều là
          SIMULATED.
        </Text>
      </Card>
      <Card>
        <Text style={ui.heading}>Hủy đặt chỗ</Text>
        <Text style={ui.text}>
          Hủy tự nguyện hợp lệ được hoàn 65% số tiền SIMULATED đã thanh toán và
          giữ lại 35% phí SIMULATED. Khi quản trị hủy vì không cung cấp được
          dịch vụ, số tiền SIMULATED được hoàn 100%. Điều kiện và thời hạn cụ
          thể được hiển thị trong đặt chỗ.
        </Text>
      </Card>
      <Card>
        <Text style={ui.heading}>Đổi lịch</Text>
        <Text style={ui.text}>
          Đổi lịch thành công có phí SIMULATED bằng 20% số tiền đặt ban đầu.
          Chênh lệch dương chỉ áp dụng cho ngày dịch vụ mới thuộc ngày lễ chính
          thức Việt Nam; không hoàn chênh lệch âm. Tổng tiền và điều kiện được
          hiển thị trước khi xác nhận.
        </Text>
      </Card>
    </Screen>
  );
}
