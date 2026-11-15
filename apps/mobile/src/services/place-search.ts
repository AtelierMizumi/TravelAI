export interface SearchablePlace {
  id: number;
  name: string;
  province?: string | null;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("vi").replace(/đ/g, "d").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ");
}

export function searchPlaces<T extends SearchablePlace>(places: T[], query: string): T[] {
  const term = normalize(query);
  if (term.length < 2) return [];
  return places.filter((place) => normalize(`${place.name} ${place.province || ""}`).includes(term)).slice(0, 20);
}
