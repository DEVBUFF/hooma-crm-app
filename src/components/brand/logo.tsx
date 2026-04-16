// Shared brand primitives — ported from the landing so every surface
// speaks with the same mark. Keep stroke/paths identical to /src/app/page.tsx
// so a future SVG swap only needs to happen here.

type Size = number | `${number}`

export function HoomaMark({
  size = 26,
  className,
  color = "#6B72C9",
}: {
  size?: Size
  className?: string
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="75" cy="68" rx="32" ry="42" fill={color} transform="rotate(-12 75 68)" />
      <ellipse cx="140" cy="78" rx="16" ry="22" fill={color} transform="rotate(8 140 78)" />
      <ellipse cx="170" cy="118" rx="9" ry="14" fill={color} />
      <ellipse cx="68" cy="140" rx="26" ry="22" fill={color} />
      <ellipse cx="120" cy="148" rx="22" ry="26" fill={color} />
    </svg>
  )
}

export function HoomaLogo({
  size = 22,
  wordmarkSize = 18,
  className,
}: {
  size?: Size
  wordmarkSize?: number
  className?: string
}) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        fontSize: wordmarkSize,
        color: "#0A0A1A",
      }}
    >
      <HoomaMark size={size} />
      <span>Hooma</span>
    </span>
  )
}
