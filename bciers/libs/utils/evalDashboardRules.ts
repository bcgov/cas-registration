import { ContentItem, LinkItem } from "../types/src/tiles";
import { actionHandler } from "../actions/src/actions";

/**
 * Evaluates conditions for dashboard data items and their links.
 * Filters out items and links based on their conditions.
 *
 * @param items - Array of ContentItem objects to evaluate.
 * @returns Filtered array of ContentItem objects.
 */
const evalDashboardRules = async (
  items: ContentItem[],
): Promise<ContentItem[]> => {
  const result = await Promise.all(
    items.map(async (item) => {
      // 🧩 Check if the tile (item) has a condition
      if (item.condition) {
        // 🔍 Evaluate condition for the tile
        const conditionMet = await evaluateCondition(item.condition);
        if (!conditionMet) return null; // Filter out the tile if condition is not met
      }

      // 🔗 Evaluate conditions for links inside the tile
      if (item.links && item.links.length > 0) {
        const filteredLinks = await Promise.all(
          item.links.map(async (link) => {
            if (link.condition) {
              const linkConditionMet = await evaluateCondition(link.condition);
              return linkConditionMet ? link : null; // Return link if condition is met, otherwise null
            }
            return link; // Return link if no condition is present
          }),
        );
        // Filter out null links
        item.links = filteredLinks.filter(
          (link): link is LinkItem => link !== null,
        );
      }

      return item; // Return the tile with filtered links if conditions are met
    }),
  );

  // 🧹 Filter out null tiles and return only valid ContentItem objects
  return result.filter((item): item is ContentItem => item !== null);
};

/**
 * Evaluates if a given condition is met by making an API request.
 *
 * @param condition - Condition object to evaluate.
 * @returns Boolean indicating if the condition is met.
 */
const evaluateCondition = async (condition: any): Promise<boolean> => {
  try {
    // 📍 Extract API endpoint from condition
    const apiEndpoint = condition.api;
    // 🚀 Fetch data using actionHandler
    const data = await actionHandler(apiEndpoint, "GET");
    // 📊 Extract the field value from the data
    const fieldValue = data[condition.field];
    // Check condition based on operator
    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value;
      case "notEquals":
        return fieldValue !== condition.value;
      case "in":
        return (
          Array.isArray(condition.value) && condition.value.includes(fieldValue)
        );
      case "notIn":
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue)
        );
      case "exists":
        return fieldValue !== undefined && condition.value === true;
      case "notExists":
        return fieldValue === undefined && condition.value === true;
      default:
        return false;
    }
  } catch (error) {
    console.error("Error evaluating condition:", error);
    return false;
  }
};

export default evalDashboardRules;
