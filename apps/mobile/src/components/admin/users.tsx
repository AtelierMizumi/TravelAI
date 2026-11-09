import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { Action, Card, ErrorText, Field, ui, useAction } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/services/api";
import type { User } from "@/services/types";
export function AdminUsers() {
  const users = useResource<User[]>("/users");
  const [selected, setSelected] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <>
      <ErrorText message={users.error} />
      <Action
        title="Thêm người dùng"
        onPress={() => {
          setSelected(null);
          setCreating(true);
        }}
      />
      {(creating || selected) && (
        <UserEditor
          key={selected?.id || "new"}
          user={selected}
          done={() => {
            setSelected(null);
            setCreating(false);
            users.reload();
          }}
        />
      )}
      {users.data?.map((user) => (
        <Card key={user.id}>
          <Text style={ui.heading}>{user.name}</Text>
          <Text style={ui.text}>
            {user.email} · {user.role} · {user.status}
          </Text>
          <Action
            secondary
            title="Quản lý tài khoản"
            onPress={() => {
              setCreating(false);
              setSelected(user);
            }}
          />
        </Card>
      ))}
    </>
  );
}
function UserEditor({ user, done }: { user: User | null; done: () => void }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [admin, setAdmin] = useState(user?.role === "ADMIN");
  const [blocked, setBlocked] = useState(user?.status === "blocked");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const action = useAction();
  return (
    <Card>
      <Text style={ui.heading}>
        {user ? "Sửa người dùng" : "Tạo người dùng"}
      </Text>
      <Field label="Tên" value={name} onChangeText={setName} />
      <Field
        label="Email"
        editable={!user}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Field
        label={user ? "Mật khẩu mới (để trống để giữ)" : "Mật khẩu mới"}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={ui.row}>
        <Switch
          value={admin}
          onValueChange={setAdmin}
          accessibilityLabel="Quyền quản trị"
        />
        <Text style={ui.text}>ADMIN</Text>
      </View>
      <View style={ui.row}>
        <Switch
          value={blocked}
          onValueChange={setBlocked}
          accessibilityLabel="Khóa tài khoản"
        />
        <Text style={ui.text}>Khóa tài khoản</Text>
      </View>
      <ErrorText message={action.error} />
      <Action
        title="Lưu tài khoản"
        disabled={
          action.busy ||
          !name.trim() ||
          !email ||
          (!user && password.length < 8)
        }
        onPress={() =>
          action.run(async () => {
            await api(user ? `/users/${user.id}` : "/users", {
              method: user ? "PUT" : "POST",
              body: {
                ...user,
                name,
                email,
                password,
                role: admin ? "ADMIN" : "USER",
                status: blocked ? "blocked" : "active",
                bio: user?.bio || "",
                avatar: user?.avatar || "",
              },
            });
            done();
          })
        }
      />
      {user && (
        <Action
          secondary
          title={confirmDelete ? "Xác nhận xóa người dùng" : "Xóa người dùng"}
          disabled={action.busy}
          onPress={() =>
            confirmDelete
              ? action.run(async () => {
                  await api(`/users/${user.id}`, { method: "DELETE" });
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
