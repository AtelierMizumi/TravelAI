export function destinationFor(location: string | undefined, places: { name: string; imageUrl?: string | null }[]) {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim();
  const target = normalize(location || "");
  if (!target) return undefined;
  return places.find(place => normalize(place.name) === target);
}
