import { ReportingPage } from "./pageList";
import { NavigationInformation, ReportingFlow } from "./types";

export function fetchReportingFlow(report_version_id: number): ReportingFlow {
  // fetch report type
  const reportType = "Simple Report";
  if (reportType == ReportingFlow.SimpleReport)
    return ReportingFlow.SimpleReport;

  return ReportingFlow.EIO;
}

export function getNavigationInformation(
  flow: ReportingFlow,
  page: ReportingPage,
): NavigationInformation {
  return 1 as any;
}
