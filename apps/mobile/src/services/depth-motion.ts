/** Deliberate horizontal gestures leave ordinary taps and vertical scrolling alone. */
export function horizontalDrag(dx: number, dy: number) {
  return Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 1.5;
}
export function nextSlide(index: number, direction: number, count: number) {
  return count > 0 ? ((index + direction) % count + count) % count : 0;
}
