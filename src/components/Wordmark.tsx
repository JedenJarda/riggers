/**
 * Flat text brand — "riggers" in cream + ".cz" in neon violet.
 * Used in place of the neon-logo component wherever the sign would
 * otherwise appear (hero top-left, footer).
 */
export function Wordmark({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const scale =
    size === "lg"
      ? "text-4xl md:text-5xl"
      : size === "sm"
        ? "text-xl"
        : "text-2xl md:text-3xl";
  return (
    <span
      className={`inline-block select-none font-display font-semibold tracking-tight text-cream ${scale} ${className}`}
      aria-label="riggers.cz"
    >
      riggers<span className="text-neon-300">.cz</span>
    </span>
  );
}
