import * as Linking from "expo-linking";
import { Text } from "react-native";
import { landmarkCredit } from "@/services/landmark-media";
import type { Place } from "@/services/types";
export function ImageCredit({ place }: { place: Place }) {
  const credit = landmarkCredit(place);
  return credit ? <Text accessibilityRole="link" onPress={() => void Linking.openURL(credit.source)} style={{ fontSize: 11, color: "#65755e", lineHeight: 18 }}>Ảnh: {credit.text} · Wikimedia ↗</Text> : place.imageAttribution ? <Text style={{ fontSize: 12, color: "#65755e", lineHeight: 18 }}>Ảnh: {place.imageAttribution}</Text> : null;
}
