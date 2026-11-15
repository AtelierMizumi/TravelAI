import { useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Action,
  Card,
  ErrorText,
  Field,
  Nav,
  Screen,
  ui,
  useAction,
} from "@/components/ui";
import { useAuth } from "@/context/auth";
import { api } from "@/services/api";
export default function Settings() {
  const { user, signOut } = useAuth();
  const action = useAction();
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmation, setConfirmation] = useState("");
  return (
    <Screen title="Cài đặt tài khoản" protected>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              backgroundColor: "#eaf2ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="person-outline" size={24} color="#2563eb" />
          </View>
          <View>
            <Text style={ui.heading}>{user?.name}</Text>
            <Text style={ui.text}>{user?.email}</Text>
          </View>
        </View>
        <Nav href="/profile">Thông tin cá nhân và ảnh đại diện →</Nav>
        <Nav href="/notifications">Thông báo trong ứng dụng →</Nav>
        <Nav href="/messages">Tin nhắn và người theo dõi →</Nav>
        <Nav href="/policy">Chính sách đặt chỗ SIMULATED →</Nav>
      </Card>
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#2563eb" />
          <Text style={ui.heading}>Mật khẩu và bảo mật</Text>
        </View>
        <Field
          label="Mật khẩu hiện tại"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOld}
        />
        <Field
          label="Mật khẩu mới (ít nhất 8 ký tự)"
          secureTextEntry
          value={newPassword}
          onChangeText={setNew}
        />
        <Field
          label="Xác nhận mật khẩu mới"
          secureTextEntry
          value={confirmation}
          onChangeText={setConfirmation}
        />
        <ErrorText message={action.error} />
        <Action
          title="Đổi mật khẩu và đăng xuất các phiên"
          disabled={
            action.busy ||
            !oldPassword ||
            newPassword.length < 8 ||
            newPassword !== confirmation
          }
          onPress={() =>
            action.run(async () => {
              await api(`/auth/change-password/${user!.id}`, {
                method: "PUT",
                body: {
                  oldPassword,
                  newPassword,
                  confirmPassword: confirmation,
                },
              });
              setOld("");
              setNew("");
              setConfirmation("");
              await signOut();
            })
          }
        />
      </Card>
    </Screen>
  );
}
