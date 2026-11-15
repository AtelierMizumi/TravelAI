type AuthUser = { role?: string } | null;

/**
 * Admin screen access gate. Auth must finish restoring (loading === false)
 * before any role decision; while loading the UI must not flash the
 * admin content or the denial message.
 */
export function adminAccess({
  user,
  loading,
}: {
  user: AuthUser;
  loading: boolean;
}): "loading" | "denied" | "allowed" {
  if (loading) return "loading";
  if (!user || user.role !== "ADMIN") return "denied";
  return "allowed";
}
