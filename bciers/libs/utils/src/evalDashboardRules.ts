import { ContentItem, LinkItem } from "@bciers/types/tiles";
import { actionHandler } from "@bciers/actions";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { FrontEndRoles } from "@bciers/utils/src/enums";

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
  const userRole: FrontEndRoles = await getSessionRole();

  const result = await Promise.all(
    items.map(async (item) => {
      // If item has conditions, evaluate them
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
            // If item has allowedRoles, evaluate them
            if (link.allowedRoles && Array.isArray(link.allowedRoles)) {
              if (!link.allowedRoles.includes(userRole)) return null;
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
    const apiEndpoint = condition.api;
    const data = await actionHandler(apiEndpoint, "GET");
    const fieldValue = data[condition.field];
    if (condition.allowedRoles) {
      return (
        Array.isArray(condition.value) && condition.value.includes(fieldValue)
      );
    }
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
    return false;
  }
};

export default evalDashboardRules;
