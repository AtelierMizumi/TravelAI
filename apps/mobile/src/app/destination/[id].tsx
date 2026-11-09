import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { Text, View } from "react-native";
import { MapsLink } from "@/components/maps-link";
import { Card, ErrorText, Nav, Screen, ui } from "@/components/ui";
import { useResource } from "@/hooks/use-resource";
import type { CatalogItem, Place } from "@/services/types";
import { recognitionApiUrl } from "@/services/recognition";

export default function Destination() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = useResource<Place>(`/places/${encodeURIComponent(id)}`);
  const tours = useResource<CatalogItem[]>("/tours");
  const hotels = useResource<CatalogItem[]>("/hotels");
  const name = place.data?.name?.trim();
  const [articleState, setArticle] = useState<{
    query: string;
    title: string;
    description: string;
    url: string;
  } | null>(null);
  const article = articleState?.query === name ? articleState : null;
  useEffect(() => {
    if (!name) return;
    const controller = new AbortController();
    fetch(
      `${recognitionApiUrl()}/places/summary?name=${encodeURIComponent(name)}`,
      { signal: controller.signal },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (
          !controller.signal.aborted &&
          data?.found &&
          typeof data.url === "string" &&
          data.url.startsWith("https://vi.wikipedia.org/")
        )
          setArticle({ ...data, query: name });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [name]);
  const matches = (items?: CatalogItem[] | null) =>
    name
      ? items
          ?.filter((item) =>
            `${item.name} ${item.location || ""}`
              .toLocaleLowerCase("vi")
              .includes(name.toLocaleLowerCase("vi")),
          )
          .slice(0, 4)
      : [];
  const relatedTours = matches(tours.data);
  const relatedHotels = matches(hotels.data);
  return (
    <Screen title={name || "Điểm đến"}>
      <ErrorText message={place.error} />
      {!!place.data?.imageUrl && (
        <Image
          source={{ uri: place.data.imageUrl }}
          contentFit="cover"
          style={[ui.image, { height: 360, borderRadius: 24 }]}
        />
      )}
      {place.data && (
        <Card>
          <View style={ui.row}>
            <Ionicons name="compass-outline" size={24} color="#2563eb" />
            <Text style={ui.heading}>Khám phá {name}</Text>
          </View>
          <Text style={ui.text}>
            {place.data.description ||
              "Thông tin về điểm đến đang được cập nhật."}
          </Text>
          {!!name && <MapsLink destination={name} />}
        </Card>
      )}
      {!!article && (
        <Card>
          <Text style={ui.heading}>Tìm hiểu thêm về {article.title}</Text>
          <Text style={ui.text}>{article.description}</Text>
          <Text
            accessibilityRole="link"
            onPress={() => void Linking.openURL(article.url)}
            style={ui.link}
          >
            Đọc nguồn Wikipedia →
          </Text>
        </Card>
      )}
      <Card>
        <Text style={ui.heading}>Lên kế hoạch cho chuyến đi</Text>
        <Text style={ui.text}>
          Tìm tour và nơi lưu trú được cung cấp trong hệ thống.
        </Text>
        <View style={ui.row}>
          <Nav href="/booking/tours">Khám phá tour →</Nav>
          <Nav href="/booking/hotels">Tìm khách sạn →</Nav>
        </View>
      </Card>
      {!!relatedTours?.length && (
        <Card>
          <Text style={ui.heading}>Tour liên quan</Text>
          {relatedTours.map((item) => (
            <Nav
              key={item.id}
              href={{
                pathname: "/booking/tours/[id]",
                params: { id: item.id },
              }}
            >
              {item.name} →
            </Nav>
          ))}
        </Card>
      )}
      {!!relatedHotels?.length && (
        <Card>
          <Text style={ui.heading}>Khách sạn liên quan</Text>
          {relatedHotels.map((item) => (
            <Nav
              key={item.id}
              href={{
                pathname: "/booking/hotels/[id]",
                params: { id: item.id },
              }}
            >
              {item.name} →
            </Nav>
          ))}
        </Card>
      )}
    </Screen>
  );
}
