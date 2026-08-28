export const GRADIENT_PAIRS: [string, string][] = [
  ["var(--color-primary)", "var(--color-primary-container)"],
  ["var(--color-secondary)", "var(--color-secondary-container)"],
  ["var(--color-tertiary)", "var(--color-tertiary-container)"],
  ["var(--color-secondary-container)", "var(--color-tertiary-container)"],
  ["var(--color-primary)", "var(--color-secondary-container)"],
  ["var(--color-tertiary-container)", "var(--color-primary)"],
  ["var(--color-on-primary-fixed-variant)", "var(--color-secondary)"],
];

export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function gradientFor(seed: string): string {
  const [a, b] = GRADIENT_PAIRS[hashSeed(seed) % GRADIENT_PAIRS.length];
  const angle = 115 + (hashSeed(seed + "angle") % 60);
  return `linear-gradient(${angle}deg, ${a}, ${b})`;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
