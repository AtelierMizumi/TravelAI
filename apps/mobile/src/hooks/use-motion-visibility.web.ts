import { useEffect, type RefObject } from 'react';

export type MotionVisibility = { visible: boolean; active: boolean; reduced: boolean; supported: boolean };
type Listener = (state: MotionVisibility, stop: () => void) => void;
type Entry = { visible: boolean; notify: () => void };
const entries = new Map<Element, Entry>();
let observer: IntersectionObserver | undefined;
let preference: MediaQueryList | undefined;
function notifyAll() { for (const entry of [...entries.values()]) entry.notify(); }
function releaseGlobals() {
  if (entries.size) return;
  observer?.disconnect(); observer = undefined;
  document.removeEventListener('visibilitychange', notifyAll);
  preference?.removeEventListener('change', notifyAll); preference = undefined;
}

/** One shared observer, no scroll handler or per-frame React state. */
export function useMotionVisibility(ref: RefObject<HTMLElement | null>, listener: Listener) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      observer?.unobserve(node); entries.delete(node); releaseGlobals();
    };
    if (!observer && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(changes => {
        for (const change of changes) {
          const entry = entries.get(change.target);
          if (entry) { entry.visible = change.isIntersecting; entry.notify(); }
        }
      }, { threshold: 0, rootMargin: '0px 0px -48px 0px' });
      preference = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
      document.addEventListener('visibilitychange', notifyAll);
      preference?.addEventListener('change', notifyAll);
    }
    const entry: Entry = {
      visible: false,
      notify: () => listener({ visible: entry.visible, active: !document.hidden, reduced: preference?.matches ?? true, supported: !!observer && typeof node.animate === 'function' }, stop),
    };
    entries.set(node, entry);
    entry.notify();
    if (!stopped) observer?.observe(node);
    return stop;
  }, [ref, listener]);
}
