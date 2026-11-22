import { MotionEntry } from "@/components/motion-entry";
import { useState } from 'react';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { Card, ErrorText, SearchBar, Nav, Screen, ui } from '@/components/ui';
import { useResource } from '@/hooks/use-resource';
import { searchPlaces } from '@/services/place-search';
import type { Place } from '@/services/types';

export default function Explore() {
  const places = useResource<Place[]>('/places', 0, true);
  const [query, setQuery] = useState('');
  const matches = query.trim() ? searchPlaces(places.data || [], query) : places.data || [];
  return <Screen title="Khám phá">
    <Card section="explore-intro"><Text style={ui.heading}>Chọn hành trình của bạn</Text><View style={ui.row}>
      <Nav href="/booking/tours">Khám phá tour</Nav><Nav href="/booking/hotels">Tìm khách sạn</Nav>
      <Nav href="/ai-chat">Trợ lý du lịch AI</Nav><Nav href="/policy">Chính sách</Nav>
    </View></Card>
    <SearchBar loading={places.loading} label="Tìm điểm đến" value={query} onChangeText={setQuery} placeholder="Tên địa danh hoặc tỉnh/thành" />
    <MotionEntry section="explore-destinations"><Text style={ui.heading}>Điểm đến dành cho bạn</Text></MotionEntry>
    <ErrorText message={places.error} />
    {matches.map(place => <Card key={place.id} hoverSurface><Link href={{ pathname: '/destination/[id]', params: { id: place.id } }} style={ui.heading}>{place.name}</Link><Text style={ui.text}>{place.description}</Text></Card>)}
    {!places.loading && !places.error && matches.length === 0 && <Text style={ui.text}>Chưa có điểm đến phù hợp.</Text>}
  </Screen>;
}
