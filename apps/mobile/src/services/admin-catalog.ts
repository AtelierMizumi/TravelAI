export type CatalogKind = "tours" | "hotels" | "places";

/** Tours and hotels: the public list hides inactive items, so admins read the full catalog. */
export function adminCatalogPath(kind: CatalogKind): string {
  return kind === "places" ? "/places" : `/admin/catalog/${kind}`;
}

export interface CatalogFilterable {
  name?: string;
  location?: string | null;
  province?: string | null;
  price?: number | null;
  rating?: number | null;
  status?: string | null;
}
export interface CatalogFilters {
  search?: string;
  province?: string;
  status?: string;
  maxPrice?: number;
  minRating?: number;
}

const lower = (value: string) => value.toLocaleLowerCase("vi");
/** Maps a province or free-form address to a province name (pass provinceFor from services/provinces). */
export type ProvinceResolver = (location?: string | null) => string | null;

/** Search, province, status, maximum SIMULATED price and minimum catalog rating, all optional and combined with AND. */
export function filterCatalog<T extends CatalogFilterable>(items: T[], filters: CatalogFilters, provinceFor: ProvinceResolver): T[] {
  const needle = lower((filters.search || "").trim());
  return items.filter((item) => {
    if (needle && !lower(`${item.name || ""} ${item.location || ""} ${item.province || ""}`).includes(needle)) return false;
    if (filters.province && provinceFor(item.province || item.location) !== filters.province) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.maxPrice !== undefined && !(typeof item.price === "number" && item.price <= filters.maxPrice)) return false;
    if (filters.minRating !== undefined && filters.minRating > 0 && !(typeof item.rating === "number" && item.rating >= filters.minRating)) return false;
    return true;
  });
}

/** Provinces that actually occur in the data, for the filter list. */
export function catalogProvinces(items: CatalogFilterable[], provinceFor: ProvinceResolver): string[] {
  return [...new Set(items.map((item) => provinceFor(item.province || item.location)).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b, "vi"));
}
