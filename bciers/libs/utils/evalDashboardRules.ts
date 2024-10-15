import { ContentItem, LinkItem } from "../types/src/tiles";
import { actionHandler } from "../actions/src/actions";

/**
 * Evaluates conditions for dashboard data items and their links.
 * Filters out items and links based on their conditions.
 *
 * @param items - Array of ContentItem objects to evaluate.
 * @returns Filtered array of ContentItem objects.
 */ const evalDashboardRules = async (
  items: ContentItem[] | null | undefined,
): Promise<ContentItem[]> => {
  if (!Array.isArray(items)) {
    items = [];
  }

  const result = await Promise.all(
    items.map(async (item) => {
      if (item.conditions && Array.isArray(item.conditions)) {
        const allConditionsMet = await evaluateAllConditions(item.conditions);
        if (!allConditionsMet) return null;
      }

      if (item.links && item.links.length > 0) {
        const filteredLinks = await Promise.all(
          item.links.map(async (link) => {
            if (link.conditions && Array.isArray(link.conditions)) {
              const allLinkConditionsMet = await evaluateAllConditions(
                link.conditions,
              );
              return allLinkConditionsMet ? link : null;
            }
            return link;
          }),
        );
        item.links = filteredLinks.filter(
          (link): link is LinkItem => link !== null,
        );
      }

      return item;
    }),
  );

  return result.filter((item): item is ContentItem => item !== null);
};

const evaluateAllConditions = async (conditions: any[]): Promise<boolean> => {
  try {
    const conditionResults = await Promise.all(
      conditions.map((condition) => evaluateCondition(condition)),
    );
    return conditionResults.every((result) => result === true);
  } catch (error) {
    console.error("Error evaluating conditions:", error);
    return false;
  }
};

const evaluateCondition = async (condition: any): Promise<boolean> => {
  try {
    if (
      condition.api == "registration/user-operators/current/has-required-fields"
    ) {
      console.log("Evaluating condition:", condition); // Log condition details
    }
    const apiEndpoint = condition.api;
    const data = await actionHandler(apiEndpoint, "GET");
    if (
      condition.api == "registration/user-operators/current/has-required-fields"
    ) {
      console.log("API response:", data); // Log API response
    }

    const fieldValue = data[condition.field];

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
