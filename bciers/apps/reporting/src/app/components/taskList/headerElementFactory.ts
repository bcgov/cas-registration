import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { HeaderStep } from "./types";

/**
 * For each header step, the tasklist can supply a root element to match the designs
 */
export const headerElementFactories: {
  [Step in HeaderStep]?: (context: any) => TaskListElement;
} = {
  [HeaderStep.OperationInformation]: () => ({
    type: "Section",
    title: "Operation information",
    isExpanded: true,
  }),
  [HeaderStep.ReportInformation]: (context) => ({
    type: "Section",
    title: `${context?.facilityName ?? "Facility"} information`,
    isExpanded: true,
  }),
};

export function headerElementFactory(
  step: HeaderStep,
  context: any,
): TaskListElement | undefined {
  const factory = headerElementFactories[step];
  return factory && factory(context);
}
