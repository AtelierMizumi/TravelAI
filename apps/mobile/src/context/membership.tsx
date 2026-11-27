import { createContext, useContext, type PropsWithChildren } from "react";
import { useAuth } from "@/context/auth";
import { useResource } from "@/hooks/use-resource";
import type { MonetizationSummary } from "@/services/types";

export interface MembershipContextValue {
  summary: MonetizationSummary | null;
  loading: boolean;
  tier: string;
  planName: string;
  badge: string | null;
  discountPercent: number;
  waiveFirstRescheduleFee: boolean;
  unlimitedAi: boolean;
  isPremium: boolean;
  isVip: boolean;
  totalSavedVnd: number;
  expiresAt: string | null;
  reloadMembership: () => void;
}

const DEFAULT_MEMBERSHIP: MembershipContextValue = {
  summary: null,
  loading: false,
  tier: "FREE",
  planName: "Cơ Bản (Free)",
  badge: null,
  discountPercent: 0,
  waiveFirstRescheduleFee: false,
  unlimitedAi: false,
  isPremium: false,
  isVip: false,
  totalSavedVnd: 0,
  expiresAt: null,
  reloadMembership: () => {},
};

const MembershipContext = createContext<MembershipContextValue>(DEFAULT_MEMBERSHIP);

export function MembershipProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const resource = useResource<MonetizationSummary>(
    user ? "/monetization/me" : null,
    0,
    true,
    user?.id,
  );
  const sub = user ? resource.data?.currentSubscription : null;
  const active = sub?.status === "ACTIVE" && sub.planCode !== "FREE";
  const tier = active ? sub.planCode : "FREE";

  const value: MembershipContextValue = {
    summary: user ? resource.data : null,
    loading: resource.loading,
    tier,
    planName: active ? sub.planName : "Cơ Bản (Free)",
    badge: active ? sub.badge : null,
    discountPercent: active ? sub.discountPercent : 0,
    waiveFirstRescheduleFee: Boolean(active && sub.waiveFirstRescheduleFee),
    unlimitedAi: Boolean(active && sub.unlimitedAi),
    isPremium: Boolean(active),
    isVip: Boolean(active && tier === "VIP"),
    totalSavedVnd: user ? resource.data?.totalBookingSavedVnd || 0 : 0,
    expiresAt: active ? sub.expiresAt || null : null,
    reloadMembership: resource.reload,
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  return useContext(MembershipContext);
}
