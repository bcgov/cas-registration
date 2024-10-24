import { ContentItem } from "@bciers/types/tiles";

/**
 * Replaces a static href value in a list of dashboard content items with a dynamic value based on conditions
 * and optionally appends a title based on conditions.
 *
 * @param items - Array of ContentItem objects containing dashboard data.
 * @param replaceValue - The static part of the href to be replaced.
 * @param getNewValue - A function that returns the dynamic value based on the current item.
 * @param getTitle - A function that returns the title based on the current item.
 * @returns A new array of ContentItems with updated href values.
 */
const updateDashboardDataHref = (
  items: ContentItem[],
  replaceValue: string,
  getNewValue: (item: ContentItem) => string,
  getTitle: (item: ContentItem) => string = () => "",
): ContentItem[] => {
  return items.map((item) => {
    const newValue = getNewValue(item); // Determine the new value based on the item's properties
    const title = getTitle(item); // Determine the title based on the item's properties
    return {
      ...item,
      href: item.href.replace(replaceValue, newValue) + title,
    };
  });
};

export default updateDashboardDataHref;
