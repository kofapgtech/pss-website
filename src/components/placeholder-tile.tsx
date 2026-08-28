import { gradientFor, initials } from "@/lib/placeholder";

type PlaceholderTileProps = {
  seed: string;
  icon?: string;
  label?: string;
  className?: string;
  dotPattern?: boolean;
};

export function PlaceholderTile({
  seed,
  icon,
  label,
  className = "",
  dotPattern = false,
}: PlaceholderTileProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: gradientFor(seed) }}
      aria-hidden="true"
    >
      {dotPattern && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.9) 1px, transparent 0)",
            backgroundSize: "16px 16px",
          }}
        />
      )}
      <div className="relative z-10 flex flex-col items-center gap-2 text-on-primary">
        {icon && (
          <span className="material-symbols-outlined text-4xl drop-shadow-sm">{icon}</span>
        )}
        {label && (
          <span className="max-w-[80%] text-center text-xs font-semibold uppercase tracking-wide drop-shadow-sm">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export function LogoMonogram({
  seed,
  name,
  className = "",
}: {
  seed: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg font-heading font-bold text-on-primary ${className}`}
      style={{ background: gradientFor(seed) }}
      aria-hidden="true"
    >
      {initials(name)}
    </div>
  );
}
