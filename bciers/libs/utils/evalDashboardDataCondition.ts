import { ContentItem } from "../types/src/tiles";
import { actionHandler } from "@bciers/actions";

/**
 * Evaluates conditions for dashboard data items.
 * Filters out items based on their conditions.
 *
 * @param items - Array of ContentItem objects to evaluate.
 * @returns Filtered array of ContentItem objects.
 */
const evalDashboardDataCondition = async (
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
 * @param condition - Condition object to evaluate. 🔍
 * @returns Boolean indicating if the condition is met. ✅/❌
 */
const evaluateCondition = async (condition: any): Promise<boolean> => {
  try {
    // 📍 Extract API endpoint from condition
    const apiEndpoint = condition.api;
    //  🚀 Fetch data using actionHandler
    const data = await actionHandler(apiEndpoint, "GET");
    const fieldValue = data[condition.field]; // 📊 Extract the field value from the data

    // Check condition based on operator
    switch (condition.operator) {
      case "equals":
        return fieldValue === condition.value; // 📏 Check for equality
      case "notEquals":
        return fieldValue !== condition.value; // 🚫 Check for inequality
      case "in":
        return (
          Array.isArray(condition.value) && condition.value.includes(fieldValue)
        ); // 📈 Check if fieldValue is in the array
      case "notIn":
        return (
          Array.isArray(condition.value) &&
          !condition.value.includes(fieldValue)
        ); // 📉 Check if fieldValue is not in the array
      case "exists":
        return fieldValue !== undefined && condition.value === true; // ✅ Check if field exists
      case "notExists":
        return fieldValue === undefined && condition.value === true; // ❌ Check if field does not exist
      default:
        return false; // ❓ Return false if operator is unknown
    }
  } catch (error) {
    console.error("Error evaluating condition:", error); // 🛑 Log any errors
    return false; // ❌ Return false if there was an error
  }
};

export default evalDashboardDataCondition;
