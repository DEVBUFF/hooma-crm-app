function PawIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 132 126"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M75.88,62.59c-2.41-4.83-2.4-11.8,0-15.63,2.42-3.93,6.32-3.13,8.76,1.74,2.45,4.8,2.45,11.87.03,15.74-2.44,3.87-6.37,3.06-8.79-1.84Z" />
      <path d="M58.06,88.34c-6.08,1.71-12.86-.67-15.21-5.32-2.44-4.72.58-9.88,6.72-11.64,6.08-1.78,12.96.62,15.33,5.31,2.36,4.72-.68,9.94-6.84,11.65Z" />
      <path d="M68.85,84.61c-1.74-4.98-.37-11.19,3.04-13.93,3.46-2.82,7.64-1.02,9.41,4.01,1.79,4.97.41,11.26-3.03,14.03-3.46,2.76-7.69.94-9.43-4.11Z" />
      <path d="M55.23,66.61c-7.55-5.31-12.56-15.7-11.27-23.29,1.26-7.76,8.42-9.62,16.06-4.28,7.6,5.23,12.7,15.76,11.4,23.42-1.33,7.67-8.56,9.56-16.19,4.16Z" />
      <path d="M83.77,74.84c-.4-2.6.64-5.84,2.32-7.26,1.71-1.47,3.4-.52,3.81,2.11.42,2.59-.62,5.88-2.32,7.31-1.71,1.43-3.42.48-3.81-2.16Z" />
    </svg>
  )
}

export function HoomaLogo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <PawIcon className="w-7 h-7 text-primary" />
      <span
        className="text-[20px] font-medium tracking-[-0.3px] text-text-primary font-display"
      >
        hooma
      </span>
    </div>
  )
}

export { PawIcon }
