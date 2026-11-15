import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { Action, Card, ErrorText, Field, Nav, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Settings } from "@/services/types";
export function AdminSettings() {
  const resource = useResource<Settings>("/admin/system-settings");
  return (
    <>
      <ErrorText message={resource.error} />
      {resource.data && (
        <SettingsEditor
          settings={resource.data}
        />
      )}
    </>
  );
}
function SettingsEditor({ settings }: { settings: Settings }) {
  const [name, setName] = useState(settings.siteName);
  const [email, setEmail] = useState(settings.adminEmail);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [notifications, setNotifications] = useState(settings.systemNotify);
  const [emailNotifications, setEmailNotifications] = useState(settings.emailNotify);
  const action = useAction();
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Card>
        <Text style={ui.heading}>Thông tin hệ thống</Text>
        <Field label="Tên hệ thống" value={name} onChangeText={setName} />
        <Field label="Email quản trị" value={email} onChangeText={setEmail} autoCapitalize="none" />
      </Card>
      <Card>
        <Text style={ui.heading}>Bảo trì</Text>
        <View style={ui.row}>
          <Switch accessibilityLabel="Bảo trì" value={maintenance} onValueChange={setMaintenance} />
          <Text style={ui.text}>Chế độ bảo trì</Text>
        </View>
        <Text style={ui.text}>Khi bật, người dùng thường không thể đặt chỗ hoặc thanh toán mới; quản trị viên vẫn thao tác được. Có hiệu lực ngay trên máy chủ.</Text>
      </Card>
      <Card>
        <Text style={ui.heading}>Thông báo</Text>
        <View style={ui.row}>
          <Switch accessibilityLabel="Thông báo hệ thống" value={notifications} onValueChange={setNotifications} />
          <Text style={ui.text}>Thông báo trong hệ thống</Text>
        </View>
        <View style={ui.row}>
          <Switch accessibilityLabel="Thông báo email" value={emailNotifications} onValueChange={setEmailNotifications} />
          <Text style={ui.text}>Thông báo qua email</Text>
        </View>
        <Text style={ui.text}>Hai cờ này hiện chỉ được lưu lại. Máy chủ chưa đọc chúng khi gửi thông báo, nên thay đổi ở đây chưa làm đổi hành vi gửi.</Text>
      </Card>
      <Card>
        <Text style={ui.heading}>Bảo mật</Text>
        <Text style={ui.text}>Mật khẩu của chính bạn được đổi trong cài đặt tài khoản cá nhân.</Text>
        <Nav href="/settings">Đổi mật khẩu cá nhân</Nav>
      </Card>
      <ErrorText message={action.error} />
      {saved && !action.error && <Text style={ui.text}>Đã lưu cấu hình.</Text>}
      <Action
        title="Lưu cấu hình"
        disabled={action.busy}
        onPress={() =>
          action.run(async () => {
            setSaved(false);
            await api("/system-settings", {
              method: "PUT",
              body: {
                ...settings,
                siteName: name,
                adminEmail: email,
                maintenanceMode: maintenance,
                systemNotify: notifications,
                emailNotify: emailNotifications,
              },
            });
            setSaved(true);
          })
        }
      />
    </>
  );
}
