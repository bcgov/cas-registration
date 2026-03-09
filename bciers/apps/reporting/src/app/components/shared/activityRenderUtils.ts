/**
 * Shared rendering utilities used by both the final-review ActivityView and
 * the change-review ObjectRenderer to format activity/source-type data.
 */

/**
 * Explicit plural → singular label map for common array keys.
 */
export const SINGULAR_LABEL_MAP: Record<string, string> = {
  units: "Unit",
  fuels: "Fuel",
  emissions: "Emission",
  feedstocks: "Feedstock",
  carbonates: "Carbonate",
};

/**
 * Converts a camelCase or PascalCase key into a spaced Title Case string.
 * e.g. "fuelName" → "Fuel Name", "GHGEmissions" → "GHG Emissions"
 */
export const formatKey = (key: string): string =>
  key
    .replace(/(?<=[A-Z])([A-Z])(?=[a-z])/g, " $1") // e.g. "GHGEmissions" → "GHG Emissions"
    .replace(/([a-z\d])([A-Z])/g, "$1 $2") // e.g. "fuelName" → "fuel Name"
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

/**
 * Converts a camelCase array key into a singular human-readable label.
 * 1. Checks SINGULAR_LABEL_MAP first (emissions → Emission, etc.)
 * 2. Otherwise splits camelCase into words via formatKey, then strips a
 *    trailing "s" from the last word only.
 *    e.g. "limeTypes" → "Lime Type", "monthlyData" → "Monthly Data"
 */
export const singularizeLabel = (key: string): string => {
  const explicit = SINGULAR_LABEL_MAP[key.toLowerCase()];
  if (explicit) return explicit;
  const words = formatKey(key).split(" ");
  const last = words[words.length - 1];
  if (last.endsWith("s")) words[words.length - 1] = last.slice(0, -1);
  return words.join(" ");
};
