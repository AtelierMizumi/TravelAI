import { useCallback, useEffect, useRef } from 'react';
import { useMotionVisibility, type MotionVisibility } from '@/hooks/use-motion-visibility.web';
import type { MotionEntryProps } from './motion-entry.types';

const timing = { hero: { duration: 600, distance: 12 }, reveal: { duration: 240, distance: 10 }, page: { duration: 200, distance: 0 } };

/** Readable SSR/no-JS endpoint. Only a visible, capability-checked element animates. */
export function MotionEntry({ children, kind = 'reveal', section }: MotionEntryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const complete = useRef(false);
  const stopWatching = useRef<() => void>(() => {});
  const finish = useCallback(() => {
    complete.current = true;
    if (animation.current) { animation.current.onfinish = null; animation.current.cancel(); animation.current = null; }
    if (ref.current) ref.current.dataset.motionState = 'complete';
    stopWatching.current();
  }, []);
  const update = useCallback((state: MotionVisibility, stop: () => void) => {
    stopWatching.current = stop;
    const node = ref.current;
    if (!node) return;
    let hashTarget: HTMLElement | null = null;
    try { if (location.hash) hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* Malformed fragments must not block content. */ }
    if (complete.current || state.reduced || !state.supported || node.contains(document.activeElement) || (hashTarget && node.contains(hashTarget))) { finish(); return; }
    if (!state.visible || !state.active) {
      if (!animation.current) node.dataset.motionState = 'waiting';
      if (animation.current) { animation.current.pause(); node.dataset.motionState = 'paused'; }
      return;
    }
    if (!animation.current) {
      const token = timing[kind];
      animation.current = node.animate([
        { opacity: 0, transform: `translateY(${token.distance}px)` },
        { opacity: 1, transform: 'translateY(0px)' },
      ], { duration: token.duration, easing: 'cubic-bezier(0.2,0.7,0.3,1)', fill: 'none' });
      animation.current.onfinish = finish;
    } else animation.current.play();
    node.dataset.motionState = 'entering';
  }, [kind, finish]);
  useMotionVisibility(ref, update);
  useEffect(() => {
    const node = ref.current;
    // Intentional interaction/anchor focus must never wait for or replay an entry.
    const onHash = () => { if (location.hash && node?.querySelector(':target')) finish(); };
    node?.addEventListener('focusin', finish);
    node?.addEventListener('pointerdown', finish);
    window.addEventListener('hashchange', onHash);
    return () => {
      node?.removeEventListener('focusin', finish); node?.removeEventListener('pointerdown', finish);
      window.removeEventListener('hashchange', onHash);
      if (animation.current) { animation.current.onfinish = null; animation.current.cancel(); }
    };
  }, [finish]);
  return <div ref={ref} data-motion-kind={kind} data-motion-section={section} data-motion-state="ready"
    style={kind === 'page' ? { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } : undefined}>{children}</div>;
}
