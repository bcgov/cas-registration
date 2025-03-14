import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { HeaderStep, TaskListPageFactoryContext } from "./types";

/**
 * For each header step, the tasklist can supply a root element to match the designs
 */
export const headerElementFactories: {
  [Step in HeaderStep]?: (
    context: TaskListPageFactoryContext,
  ) => TaskListElement;
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
  [HeaderStep.SignOffSubmit]: () => ({
    type: "Section",
    title: "Sign-off & submit",
    isExpanded: true,
  }),
};

export function headerElementFactory(
  step: HeaderStep,
  context: TaskListPageFactoryContext,
): TaskListElement | undefined {
  const factory = headerElementFactories[step];
  return factory && factory(context);
}
