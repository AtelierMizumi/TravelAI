import { Platform, useWindowDimensions } from 'react-native';
import { useHydrated } from './use-hydrated';

export function useCompactNavigation() {
  const { width } = useWindowDimensions();
  const hydrated = useHydrated();
  return Platform.OS !== 'web' || !hydrated || width < 900;
}
