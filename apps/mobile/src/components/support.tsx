import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

export function Support() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const visit = async (url: string) => {
    try {
      await Linking.openURL(url);
      setError("");
    } catch {
      setError("Không mở được ứng dụng liên hệ trên thiết bị này.");
    }
  };
  return (
    <View style={styles.container}>
      {open && (
        <View style={styles.panel}>
          <Text style={styles.title}>Liên hệ hỗ trợ</Text>
          <Pressable
            accessibilityRole="link"
            style={styles.link}
            onPress={() => void visit("tel:0382685400")}
          >
            <Ionicons name="call-outline" size={19} color="#2563eb" />
            <Text style={styles.text}>0382685400</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            style={styles.link}
            onPress={() => void visit("https://www.facebook.com/tibberrr")}
          >
            <Ionicons name="logo-facebook" size={19} color="#2563eb" />
            <Text style={styles.text}>Facebook</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            style={styles.link}
            onPress={() => void visit("mailto:ngoc492005@gmail.com")}
          >
            <Ionicons name="mail-outline" size={19} color="#2563eb" />
            <Text style={styles.text}>Email</Text>
          </Pressable>
          {!!error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? "Đóng hỗ trợ" : "Mở liên hệ hỗ trợ"}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(!open)}
        style={styles.trigger}
      >
        <Ionicons
          name={open ? "close" : "headset-outline"}
          color="#2563eb"
          size={21}
        />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: 20,
    bottom: 88,
    alignItems: "flex-end",
    gap: 10,
  },
  trigger: {
    height: 44,
    width: 44,
    borderRadius: 22,
    borderColor: "#dce6f6",
    borderWidth: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  panel: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e3eaf4",
    padding: 16,
    borderRadius: 18,
    width: 220,
    gap: 12,
    elevation: 6,
    shadowColor: "#1d3a66",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { color: "#16233d", fontWeight: "800", fontSize: 15 },
  link: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 32 },
  text: { color: "#334155", fontWeight: "600" },
  error: { color: "#b91c1c", fontSize: 12 },
});
