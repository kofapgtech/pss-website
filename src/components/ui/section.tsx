export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`w-full px-4 py-16 md:px-12 md:py-20 ${className}`}>
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <p
            className={`mb-2 text-xs font-bold uppercase tracking-[0.15em] ${
              tone === "dark" ? "text-primary-fixed-dim" : "text-secondary"
            }`}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className={`font-heading text-3xl font-bold tracking-tight md:text-4xl ${
            tone === "dark" ? "text-surface-bright" : "text-on-background"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p
            className={`mt-3 max-w-2xl text-lg ${
              tone === "dark" ? "text-surface-variant" : "text-on-surface-variant"
            }`}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
