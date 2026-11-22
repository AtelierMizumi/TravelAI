import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { View } from 'react-native';
import { useHydrated } from '@/hooks/use-hydrated';

/** Expo's mutable font cache must not decide markup inside delayed SSR boundaries. */
export function HydrationSafeIonicon(props: ComponentProps<typeof Ionicons>) {
  const hydrated = useHydrated();
  const size = props.size ?? 16;
  return <View pointerEvents="none" style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {hydrated ? <Ionicons {...props} /> : null}
  </View>;
}
