export function HoomaLogo({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 140 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Hooma"
      >
        <circle cx="12" cy="20" r="8" fill="url(#logoGradient)" />
        <circle cx="12" cy="20" r="4" fill="#ffffff" opacity="0.7" />
        <text
          x="28"
          y="27"
          fontFamily="var(--font-nunito), Nunito, sans-serif"
          fontWeight="700"
          fontSize="24"
          letterSpacing="-0.02em"
          fill="#1d1d1f"
        >
          hooma
        </text>
        <defs>
          <linearGradient id="logoGradient" x1="4" y1="12" x2="20" y2="28">
            <stop stopColor="#0071e3" />
            <stop offset="1" stopColor="#64acff" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
