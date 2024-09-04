import { ContentItem } from "../types/src/tiles";
import { actionHandler } from "../actions/src/actions";

/**
 * Evaluates conditions for dashboard data items.
 * Filters out items based on their conditions.
 *
 * @param items - Array of ContentItem objects to evaluate.
 * @returns Filtered array of ContentItem objects.
 */
const evalDashboardRules = async (
  items: ContentItem[],
): Promise<ContentItem[]> => {
  // Evaluate all items and filter based on condition
  const result = await Promise.all(
    items.map(async (item) => {
      // 🧩 Check if the item has a condition
      if (item.condition) {
        // 🔍 Evaluate condition
        const conditionMet = await evaluateCondition(item.condition);
        return conditionMet ? item : null; // Return item if condition is met, otherwise null
      }
      return item; // Return item if no condition is present
    }),
  );
  // 🧹 Filter out null values and return only valid ContentItem objects
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
    //  🚀 Fetch data using actionHandler
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
