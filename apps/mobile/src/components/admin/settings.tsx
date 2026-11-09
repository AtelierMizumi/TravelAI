import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { Action, Card, ErrorText, Field, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { Settings } from "@/services/types";
export function AdminSettings() {
  const resource = useResource<Settings>("/system-settings");
  return (
    <>
      <ErrorText message={resource.error} />
      {resource.data && (
        <SettingsEditor
          key={JSON.stringify(resource.data)}
          settings={resource.data}
          reload={resource.reload}
        />
      )}
    </>
  );
}
function SettingsEditor({
  settings,
  reload,
}: {
  settings: Settings;
  reload: () => void;
}) {
  const [name, setName] = useState(settings.siteName);
  const [email, setEmail] = useState(settings.adminEmail);
  const [maintenance, setMaintenance] = useState(settings.maintenanceMode);
  const [notifications, setNotifications] = useState(settings.systemNotify);
  const action = useAction();
  return (
    <Card>
      <Field label="Tên hệ thống" value={name} onChangeText={setName} />
      <Field
        label="Email quản trị"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View style={ui.row}>
        <Switch
          accessibilityLabel="Bảo trì"
          value={maintenance}
          onValueChange={setMaintenance}
        />
        <Text style={ui.text}>Chế độ bảo trì</Text>
      </View>
      <View style={ui.row}>
        <Switch
          accessibilityLabel="Thông báo hệ thống"
          value={notifications}
          onValueChange={setNotifications}
        />
        <Text style={ui.text}>Thông báo trong hệ thống</Text>
      </View>
      <ErrorText message={action.error} />
      <Action
        title="Lưu cấu hình"
        disabled={action.busy}
        onPress={() =>
          action.run(async () => {
            await api("/system-settings", {
              method: "PUT",
              body: {
                ...settings,
                siteName: name,
                adminEmail: email,
                maintenanceMode: maintenance,
                systemNotify: notifications,
                emailNotify: false,
              },
            });
            reload();
          })
        }
      />
    </Card>
  );
}
