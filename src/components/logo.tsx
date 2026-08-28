export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="Pride South Side">
      <defs>
        <linearGradient id="pss-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4648d4" />
          <stop offset="55%" stopColor="#b4136d" />
          <stop offset="100%" stopColor="#a36700" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#pss-logo-grad)" />
      <path
        d="M8 22 L20 11 L32 22"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 20.5V29a1.5 1.5 0 0 0 1.5 1.5H25.5A1.5 1.5 0 0 0 27 29V20.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="25" r="2.25" fill="#ffffff" />
    </svg>
  );
}

export function LogoLockup({
  className = "",
  markClassName = "h-10 w-10",
  wordmarkClassName = "text-lg",
  tone = "light",
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span
        className={`font-heading font-extrabold leading-none tracking-tight ${wordmarkClassName} ${
          tone === "dark" ? "text-surface-bright" : "text-on-background"
        }`}
      >
        Pride South Side
      </span>
    </span>
  );
}
