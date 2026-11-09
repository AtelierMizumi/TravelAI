import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

/** Opens Google Maps rather than embedding a map or inventing coordinates. */
export function MapsLink({ destination }: { destination: string }) {
  const [error, setError] = useState("");
  const open = async () => {
    try {
      await Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`,
      );
      setError("");
    } catch {
      setError("Không mở được Google Maps trên thiết bị này.");
    }
  };
  return (
    <View>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`Chỉ đường đến ${destination} trên Google Maps`}
        onPress={() => void open()}
        style={styles.button}
      >
        <Ionicons name="navigate-outline" size={18} color="#2563eb" />
        <Text style={styles.text}>Chỉ đường bằng Google Maps</Text>
      </Pressable>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#edf4ff",
    padding: 12,
    borderRadius: 12,
  },
  text: { color: "#2563eb", fontWeight: "700" },
  error: { color: "#b91c1c", marginTop: 8 },
});
