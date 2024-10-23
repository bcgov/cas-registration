// 🛠️ Function to update dashboard JSON data by replacing a static placeholder in href with a dynamic value, and optionally appending a title.
import { ContentItem } from "@bciers/types/tiles";

/**
 * Replaces a static href value in a list of dashboard content items with a dynamic value and optionally appends a title.
 *
 * @param items - Array of ContentItem objects containing dashboard data.
 * @param replaceValue - The static part of the href to be replaced.
 * @param newValue - The dynamic value to replace the static part of the href.
 * @param title - An optional string to append to the href after replacement (default is an empty string).
 * @returns A new array of ContentItems with updated href values.
 */
const updateDashboardDataHref = (
  items: ContentItem[],
  replaceValue: string,
  newValue: string,
  title: string = "",
): ContentItem[] => {
  return items.map((item) => {
    return {
      ...item,
      href: item.href.replace(replaceValue, newValue) + title,
    };
  });
};

export default updateDashboardDataHref;
