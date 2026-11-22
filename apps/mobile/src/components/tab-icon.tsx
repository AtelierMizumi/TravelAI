import { HydrationSafeIonicon as Ionicons } from '@/components/hydration-safe-icon';
import { useEffect, type ComponentProps } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { MorphIcon } from './morph-renderer';
import { motionIcons, type MotionIconName } from '@/services/motion-icons';

type Props = { icon: ComponentProps<typeof Ionicons>['name']; morph?: MotionIconName; focused: boolean; color: string };
export function TabIcon({ icon, morph, focused, color }: Props) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(focused ? 1 : 0.72);
  useEffect(() => { opacity.set(withTiming(focused ? 1 : 0.72, { duration: reduced ? 0 : 150 })); }, [focused, reduced, opacity]);
  const feedback = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" style={[{ width: 32, height: 30, alignItems: 'center', justifyContent: 'center' }, feedback]}>
    <View style={{ position: 'absolute', top: -3, width: 18, height: 3, borderRadius: 2, backgroundColor: focused ? color : 'transparent' }} />
    {morph ? <MorphIcon icon={motionIcons[morph][focused ? 1 : 0]} color={color} size={23} reducedMotion="always" /> : <Ionicons name={icon} size={23} color={color} />}
  </Animated.View>;
}
