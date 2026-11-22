import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View } from "react-native";
import { apiBaseUrl } from "@/services/api";
import { ui } from "./ui";

export function CatalogPhoto({ source, label, fallback, height = 220 }: { source?: string | null; label: string; fallback?: string | null; height?: number }) {
  const [failed, setFailed] = useState<string[]>([]);
  const candidate = [source, fallback].find(value => value && !failed.includes(value));
  const uri = candidate?.startsWith("/") ? apiBaseUrl().replace(/\/api$/, "") + candidate : candidate;
  return <View style={{ gap: 6 }}>
    {uri ? <Image key={uri} source={{ uri }} accessibilityLabel={label} contentFit="cover" style={[ui.image, { height }]} onError={() => setFailed(values => [...values, candidate!])} /> : <View style={[ui.image, { height, backgroundColor: "#e8eee9", justifyContent: "center", alignItems: "center", gap: 10 }]}>
      <Ionicons name="image-outline" size={36} color="#64776b" /><Text style={ui.label}>Chưa có ảnh phù hợp</Text><Text style={{ color: "#64748b" }}>Bạn vẫn có thể xem lịch và đặt chỗ.</Text>
    </View>}
    {!!candidate && candidate === fallback && candidate !== source && <Text style={{ color: "#64748b", fontSize: 12 }}>Ảnh điểm đến minh họa, không phải ảnh phòng hoặc phương tiện.</Text>}
  </View>;
}
