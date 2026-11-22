/** One portable primary-navigation definition; Router owns selected state/history. */
export const primaryTabs = [
  { id: 'home', screen: 'index', route: '/', label: 'Trang chủ', icon: 'home-outline' },
  { id: 'explore', screen: 'explore', route: '/explore', label: 'Khám phá', icon: 'compass-outline', morph: 'compass' },
  { id: 'detection', screen: 'detection', route: '/detection', label: 'AI', icon: 'camera-outline', morph: 'camera' },
  { id: 'community', screen: 'feed', route: '/feed', label: 'Cộng đồng', icon: 'people-outline', morph: 'people' },
  { id: 'account', screen: 'profile', route: '/profile', label: 'Tài khoản', icon: 'person-outline' },
] as const;
