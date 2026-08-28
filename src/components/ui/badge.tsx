type BadgeTone = "primary" | "secondary" | "tertiary" | "neutral" | "confirmed" | "pending";

const tones: Record<BadgeTone, string> = {
  primary: "bg-primary-fixed text-on-primary-fixed",
  secondary: "bg-secondary-fixed text-on-secondary-fixed",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  neutral: "bg-surface-variant text-on-surface-variant",
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
