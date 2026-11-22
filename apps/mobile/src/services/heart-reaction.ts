/** One short reaction, with neutral endpoints and no decorative motion when disabled. */
export function heartReactionFrame(progress: number, reduced: boolean) {
  'worklet';
  const t = Math.max(0, Math.min(1, progress));
  const jump = reduced ? 0 : t < 0.25 ? t / 0.25 : Math.max(0, 1 - (t - 0.25) / 0.5);
  return {
    translateY: jump ? -10 * jump : 0,
    scale: 1 + 0.3 * jump,
    floatY: -48 * t,
    opacity: reduced ? 0 : Math.min(1, t / 0.12) * (1 - t),
  };
}
