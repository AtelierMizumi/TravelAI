/** Fine-pointer hover only; feedback never changes layout or applies transforms. */
export function HoverFeedback() {
  return <style>{`
    [data-featured-destination] { position:relative; transition:background-color 180ms ease-out,border-color 180ms ease-out,box-shadow 180ms ease-out; }
[data-featured-destination]::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none; background:linear-gradient(145deg,rgba(255,255,255,.28),transparent 42%,rgba(8,127,186,.12)); opacity:0; transition:opacity 180ms ease-out; }
[data-featured-destination][data-pressed="true"]::after { opacity:1; }
@media (hover: hover) and (pointer: fine) {
      [data-hover-surface="card"], a, button, [role="button"], [role="link"], [role="tab"] {
        transition-property: background-color, border-color, color, outline-color;
        transition-duration: 150ms;
        transition-timing-function: ease-out;
      }
      [data-featured-destination] { transition-property:background-color,border-color,box-shadow; }
      [data-featured-destination]:hover { box-shadow:0 8px 22px rgba(6,92,135,.17),inset 0 1px 0 rgba(255,255,255,.8); }
  [data-featured-destination]:hover::after { opacity:1; }
  [data-hover-surface="card"]:hover { background-color: #eff9ff !important; border-color: #69bddd !important; }
      a:hover, [role="link"]:hover { color: #05628e !important; text-decoration-line: underline; }
      button:not(:disabled):not([aria-disabled="true"]):hover,
      [role="button"]:not([aria-disabled="true"]):hover,
      [role="tab"]:not([aria-disabled="true"]):hover {
        outline: 2px solid #42a9d0 !important; outline-offset: -2px;
      }
    }
    a:focus-visible, button:focus-visible, [role="button"]:focus-visible, [role="tab"]:focus-visible { outline: 2px solid #087fba; outline-offset: -2px; }
    @media (prefers-reduced-motion: reduce) {
 [data-featured-destination], [data-featured-destination]::after { transition-duration:0ms !important; }
      [data-hover-surface="card"], a, button, [role="button"], [role="link"], [role="tab"] { transition-duration: 0ms !important; }
    }
  `}</style>;
}
