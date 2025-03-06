import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { HeaderStep } from "./types";

/**
 * For each header step, the tasklist can supply a root element to match the designs
 */
export const headerElementFactories: {
  [Step in HeaderStep]?: TaskListElement;
} = {
  [HeaderStep.OperationInformation]: {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
  },
};

export function headerElementFactory(
  step: HeaderStep,
): TaskListElement | undefined {
  return headerElementFactories[step];
}
