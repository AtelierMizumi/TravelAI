import { createContext } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useSharedValue, type AnimatedRef, type SharedValue } from 'react-native-reanimated';

export const SectionViewport = createContext<{ offset: SharedValue<number>; layout: SharedValue<number>; seen: SharedValue<Record<string, boolean>>; viewport: AnimatedRef<ScrollView> } | null>(null);

/** Scroll signal stays on UI thread; only opted-in sections measure until first entry. */
export function MotionScroll({ children, ...props }: ScrollViewProps) {
  const viewport = useAnimatedRef<ScrollView>();
  const offset = useSharedValue(0);
  const layout = useSharedValue(0);
  const seen = useSharedValue<Record<string, boolean>>({});
  const onScroll = useAnimatedScrollHandler(event => { offset.value = event.contentOffset.y; });
  return <SectionViewport.Provider value={{ offset, layout, seen, viewport }}>
    <Animated.ScrollView {...props} ref={viewport} scrollEventThrottle={16} onScroll={onScroll}
      onLayout={event => { layout.set(value => value + 1); props.onLayout?.(event); }}>{children}</Animated.ScrollView>
  </SectionViewport.Provider>;
}
