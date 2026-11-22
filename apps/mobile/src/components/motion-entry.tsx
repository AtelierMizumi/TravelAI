import { useContext, useEffect } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, { cancelAnimation, measure, useAnimatedReaction, useAnimatedRef, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { SectionViewport } from './motion-scroll';
import { sectionVisible } from '@/services/section-motion';
import type { MotionEntryProps } from './motion-entry.types';

/** Non-opted-in content and page wrappers stay static; never decorate list cells. */
export function MotionEntry({ children, kind = 'reveal', section }: MotionEntryProps) {
  const viewport = useContext(SectionViewport);
  if (!viewport || kind === 'page' || !section) return <View style={kind === 'page' ? { flex: 1 } : undefined}>{children}</View>;
  return <NativeSection viewport={viewport} section={section}>{children}</NativeSection>;
}
function NativeSection({ children, viewport, section }: MotionEntryProps & { section: string; viewport: NonNullable<React.ContextType<typeof SectionViewport>> }) {
  const ref = useAnimatedRef<View>();
  const done = useSharedValue(false);
  const progress = useSharedValue(1); // Always readable, including missing native measurements.
  const layout = useSharedValue(0);
  const reduced = useSharedValue(useReducedMotion());
  const finish = () => { if (!done.value) viewport.seen.set(seen => ({ ...seen, [section]: true })); done.set(true); cancelAnimation(progress); progress.set(1); };
  useEffect(() => {
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', enabled => {
      reduced.set(enabled);
      if (enabled) { done.set(true); cancelAnimation(progress); progress.set(1); }
    });
    return () => { listener.remove(); cancelAnimation(progress); };
  }, [done, progress, reduced]);
  useAnimatedReaction(() => ({ offset: viewport.offset.value, viewportLayout: viewport.layout.value, layout: layout.value, reduced: reduced.value }), state => {
    if (done.value) return;
    if (state.reduced || viewport.seen.value[section]) { done.set(true); cancelAnimation(progress); progress.set(1); return; }
    if (!state.layout) return;
    const bounds = measure(ref);
    const container = measure(viewport.viewport);
    if (!bounds || !container || !sectionVisible(bounds.pageY, bounds.height, container.pageY, container.height)) return;
    viewport.seen.set(seen => ({ ...seen, [section]: true }));
    done.set(true);
    progress.set(0);
    progress.set(withTiming(1, { duration: 240 }));
  });
  const style = useAnimatedStyle(() => ({ opacity: progress.value, transform: [{ translateY: 8 * (1 - progress.value) }] }));
  return <Animated.View ref={ref} collapsable={false} testID={`motion-section-${section}`} onLayout={() => { layout.set(value => value + 1); }} onTouchStart={finish} onFocusCapture={finish} style={style}>{children}</Animated.View>;
}
