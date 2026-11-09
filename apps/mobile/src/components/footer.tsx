import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

/** Business contact details supplied by the site owner. */
export function Footer() {
  return (
    <View style={styles.footer}>
      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.brand}>
            Travel<Text style={styles.accent}>AI</Text>
          </Text>
          <Text style={styles.body}>
            Khám phá những hành trình mới cùng TravelAI.
          </Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.heading}>Khám phá</Text>
          <Link style={styles.link} href="/booking/tours">
            Tour du lịch
          </Link>
          <Link style={styles.link} href="/booking/hotels">
            Khách sạn
          </Link>
          <Link style={styles.link} href={"/policy" as Href}>
            Chính sách đặt chỗ
          </Link>
          <Link style={styles.link} href="/detection">
            Nhận diện hình ảnh
          </Link>
        </View>
        <View style={styles.column}>
          <Text style={styles.heading}>Liên hệ</Text>
          <Text style={styles.body}>
            Đường Tăng Bạt Hổ, xã Đức Cơ, tỉnh Gia Lai
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL("tel:0382685400")}
          >
            <Text style={styles.link}>0382685400</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            onPress={() => void Linking.openURL("mailto:ngoc492005@gmail.com")}
          >
            <Text style={styles.link}>ngoc492005@gmail.com</Text>
          </Pressable>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Facebook TravelAI"
            onPress={() =>
              void Linking.openURL("https://www.facebook.com/tibberrr")
            }
            style={styles.social}
          >
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={styles.link}>Facebook</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.bottom}>TravelAI · Khám phá theo cách của bạn</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  footer: {
    marginTop: 84,
    backgroundColor: "#101e37",
    padding: 32,
    borderRadius: 26,
  },
  columns: { flexDirection: "row", flexWrap: "wrap", gap: 32 },
  column: { flexGrow: 1, flexBasis: 220, gap: 12 },
  brand: { color: "#fff", fontSize: 26, fontWeight: "900" },
  accent: { color: "#8fb8ff" },
  heading: { color: "#fff", fontSize: 16, fontWeight: "800" },
  body: { color: "#c6d2e3", fontSize: 14, lineHeight: 22 },
  link: { color: "#d3e1f5", fontSize: 14, lineHeight: 21 },
  social: { flexDirection: "row", alignItems: "center", gap: 8 },
  bottom: {
    color: "#97a9c3",
    fontSize: 12,
    marginTop: 35,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#2a3a54",
  },
});
