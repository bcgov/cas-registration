import {
  ReportingFlow,
  ReportingPage,
  TaskListPageFactoryContext,
} from "../types";
import { pageFactories } from "./pageFactories";

export const pageElementFactory = (
  page: ReportingPage,
  activePage: ReportingPage,
  reportVersionId: number,
  facilityId: string,
  context?: TaskListPageFactoryContext,
  reportingFlow?: ReportingFlow,
) => {
  const factory = pageFactories[page];

  if (!factory)
    throw new Error(`Tasklist page factory not implemented for ${page}`);

  return factory(
    activePage,
    reportVersionId,
    facilityId,
    context,
    reportingFlow,
  );
};
