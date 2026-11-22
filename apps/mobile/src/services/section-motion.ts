/** UI-thread-safe visibility policy. Layout/scroll never depend on animation progress. */
export function sectionVisible(top: number, height: number, viewportTop: number, viewportHeight: number) {
  'worklet';
  return height > 0 && viewportHeight > 0 && top < viewportTop + viewportHeight - 16 && top + height > viewportTop + 16;
}
