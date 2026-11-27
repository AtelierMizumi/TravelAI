export interface SponsoredItemLike {
  id: string;
  targetKind: "TOUR" | "HOTEL";
  targetId: number;
  headline: string;
  sponsoredLabel: string;
}

export function subscriptionBadgeLabel(tier?: string | null): string | null {
  if (!tier) return null;
  const normalized = tier.trim().toUpperCase();
  if (normalized === "PLUS") return "⭐ Plus";
  if (normalized === "VIP") return "💎 Explorer";
  return null;
}

export function calculateCtrPercent(impressions: number, clicks: number): number {
  if (!Number.isFinite(impressions) || impressions <= 0 || !Number.isFinite(clicks) || clicks <= 0) {
    return 0;
  }
  return Math.round((clicks / impressions) * 1000) / 10;
}

export function prioritizeSponsoredCatalog<T extends { id: number }>(
  items: T[],
  sponsored: SponsoredItemLike[] | null | undefined,
  kind: "TOUR" | "HOTEL",
): { item: T; campaign: SponsoredItemLike | null }[] {
  const byTarget = new Map<number, SponsoredItemLike>();
  for (const camp of sponsored || []) {
    if (camp.targetKind === kind && !byTarget.has(camp.targetId)) {
      byTarget.set(camp.targetId, camp);
    }
  }
  const promoted: { item: T; campaign: SponsoredItemLike | null }[] = [];
  const regular: { item: T; campaign: SponsoredItemLike | null }[] = [];
  for (const item of items) {
    const camp = byTarget.get(item.id) || null;
    if (camp) promoted.push({ item, campaign: camp });
    else regular.push({ item, campaign: null });
  }
  return [...promoted, ...regular];
}
