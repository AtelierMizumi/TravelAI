export type CatalogKind = "tours" | "hotels" | "places";

/** Tours and hotels: the public list hides inactive items, so admins read the full catalog. */
export function adminCatalogPath(kind: CatalogKind): string {
  return kind === "places" ? "/places" : `/admin/catalog/${kind}`;
}
