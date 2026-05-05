/**
 * Shared rendering utilities used by both the final-review ActivityView and
 * the change-review ObjectRenderer to format activity/source-type data.
 */

/**
 * Chronological order of month and quarter keys as they appear in the
 * Cement Production (Calcination Emissions) methodology. Used both by
 * cementProductionUISchema (ui:order) and the Final Review / Submitted
 * renderers to display periods in calendar order.
 */
export const MONTH_QUARTER_ORDER: string[] = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "quarter1",
  "quarter2",
  "quarter3",
  "quarter4",
];

export const compareMethodologyKeys = (a: string, b: string): number => {
  const aIdx = MONTH_QUARTER_ORDER.indexOf(a);
  const bIdx = MONTH_QUARTER_ORDER.indexOf(b);
  if (aIdx === -1 && bIdx === -1) return 0;
  if (aIdx === -1) return -1;
  if (bIdx === -1) return 1;
  return aIdx - bIdx;
};

export const sortMethodologyEntries = (
  entries: [string, unknown][],
): [string, unknown][] =>
  [...entries].sort(([a], [b]) => compareMethodologyKeys(a, b));

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
