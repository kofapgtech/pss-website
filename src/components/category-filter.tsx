import Link from "next/link";

export function CategoryFilter({
  basePath,
  paramName = "category",
  options,
  active,
  extraParams,
}: {
  basePath: string;
  paramName?: string;
  options: string[];
  active?: string;
  extraParams?: Record<string, string>;
}) {
  const buildHref = (value: string | null) => {
    const params = new URLSearchParams(extraParams);
    if (value) params.set(paramName, value);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const isAllActive = !active;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={buildHref(null)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          isAllActive
            ? "bg-primary text-on-primary"
            : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
        }`}
      >
        All
      </Link>
      {options.map((option) => (
        <Link
          key={option}
          href={buildHref(option)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            active === option
              ? "bg-primary text-on-primary"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          {option}
        </Link>
      ))}
    </div>
  );
}
