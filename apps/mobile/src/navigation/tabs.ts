/** One portable primary-navigation definition; Router owns selected state/history. */
export const primaryTabs = [
  { id: 'home', screen: 'index', route: '/', label: 'Trang chủ', icon: 'home-outline' },
  { id: 'explore', screen: 'explore', route: '/explore', label: 'Khám phá', icon: 'compass-outline', morph: 'compass' },
  { id: 'detection', screen: 'detection', route: '/detection', label: 'AI', icon: 'camera-outline', morph: 'camera' },
  { id: 'community', screen: 'feed', route: '/feed', label: 'Cộng đồng', icon: 'people-outline', morph: 'people' },
  { id: 'account', screen: 'profile', route: '/profile', label: 'Tài khoản', icon: 'person-outline' },
] as const;

/** Screen name of the tab the router is on, or null while a screen outside the tabs is open (nothing is hidden then). */
export function activeTabScreen(segments: readonly string[]): string | null {
  return segments[0] === '(tabs)' ? segments[1] ?? 'index' : null;
}

/** On web react-native-screens is off, so a blurred tab stays mounted and must be hidden by style. */
export function hideBlurredTab(screen: string, active: string | null, isWeb: boolean): boolean {
  return isWeb && active !== null && screen !== active;
}
