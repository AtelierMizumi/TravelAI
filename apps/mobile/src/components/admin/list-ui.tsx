import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Icon = ComponentProps<typeof Ionicons>["name"];
export const adminList = StyleSheet.create({
  panel: { backgroundColor: "#fff", borderColor: "#e9edf5", borderWidth: 1, borderRadius: 18, overflow: "hidden" },
  header: { paddingHorizontal: 20, paddingVertical: 17, borderBottomWidth: 1, borderBottomColor: "#f0f3f8", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  title: { color: "#17233d", fontSize: 16, fontWeight: "800" },
  hint: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  row: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: "#f1f4f8", flexWrap: "wrap" },
  body: { flexGrow: 1, flexBasis: 240, minWidth: 0, gap: 4 },
  name: { color: "#17233d", fontSize: 14, fontWeight: "700" },
  sub: { color: "#718096", fontSize: 13, lineHeight: 19 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 7, alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" },
  badge: { alignSelf: "flex-start", borderRadius: 99, backgroundColor: "#eff6ff", paddingHorizontal: 9, paddingVertical: 5 },
  badgeText: { color: "#4665b6", fontWeight: "700", fontSize: 11 },
  empty: { color: "#94a3b8", fontSize: 13, padding: 20, textAlign: "center" },
});
export function AdminButton({ title, icon, onPress, disabled = false, tone = "soft" }: { title: string; icon: Icon; onPress: () => void; disabled?: boolean; tone?: "primary" | "soft" | "danger" }) {
  const color = tone === "primary" ? "#fff" : tone === "danger" ? "#dc5060" : "#4260c7";
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} disabled={disabled} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, backgroundColor: tone === "primary" ? "#3859dc" : tone === "danger" ? "#fff2f3" : "#f0f4ff", opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}><Ionicons name={icon} size={15} color={color}/><Text style={{ color, fontSize: 12, fontWeight: "700" }}>{title}</Text></Pressable>;
}
export function AdminPanel({ title, count, children }: PropsWithChildren<{ title: string; count?: number }>) {
  return <View style={adminList.panel}><View style={adminList.header}><View><Text style={adminList.title}>{title}</Text>{count !== undefined && <Text style={adminList.hint}>{count} kết quả</Text>}</View></View>{children}</View>;
}
