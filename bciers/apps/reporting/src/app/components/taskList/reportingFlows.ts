import {
  ELECTRICITY_IMPORT_OPERATION,
  NEW_ENTRANT_REGISTRATION_PURPOSE,
  REPORTING_OPERATION,
  SIMPLE_REPORT,
} from "../../utils/constants";
import { getRegistrationPurpose } from "../../utils/getRegistrationPurpose";
import { getReportingOperation } from "../../utils/getReportingOperation";
import { lfoFlow } from "./reportingFlows/lfoFlow";
import { lfoNewEntrantFlow } from "./reportingFlows/lfoNewEntrantFlow";
import { lfoReportingOnlyFlow } from "./reportingFlows/lfoReportingOnlyFlow";
import { sfoFlow } from "./reportingFlows/sfoFlow";
import { sfoNewEntrantFlow } from "./reportingFlows/sfoNewEntrantFlow";
import { sfoReportingOnlyFlow } from "./reportingFlows/sfoReportingOnlyFlow";
import { simpleReportFlow } from "./reportingFlows/simpleReportFlow";
import { ReportingFlow, ReportingFlowDescription } from "./types";

export const reportingFlows: {
  [Flow in ReportingFlow]?: ReportingFlowDescription;
} = {
  [ReportingFlow.SFO]: sfoFlow,
  [ReportingFlow.LFO]: lfoFlow,
  [ReportingFlow.NewEntrantLFO]: lfoNewEntrantFlow,
  [ReportingFlow.NewEntrantSFO]: sfoNewEntrantFlow,
  [ReportingFlow.ReportingOnlySFO]: sfoReportingOnlyFlow,
  [ReportingFlow.ReportingOnlyLFO]: lfoReportingOnlyFlow,
  [ReportingFlow.SimpleReport]: simpleReportFlow,
};

export async function getFlow(reportVersionId: number): Promise<ReportingFlow> {
  const reportOperationData = await getReportingOperation(reportVersionId);
  const registrationPurpose = (await getRegistrationPurpose(reportVersionId))
    .registration_purpose;

  const operationType = reportOperationData.operation_type;
  const reportType = reportOperationData.operation_report_type;

  if (reportType === SIMPLE_REPORT) return ReportingFlow.SimpleReport;

  if (registrationPurpose === ELECTRICITY_IMPORT_OPERATION)
    return ReportingFlow.EIO;

  if (operationType === "Single Facility Operation") {
    switch (registrationPurpose) {
      case NEW_ENTRANT_REGISTRATION_PURPOSE:
        return ReportingFlow.NewEntrantSFO;
      case REPORTING_OPERATION:
        return ReportingFlow.ReportingOnlySFO;
      default:
        return ReportingFlow.SFO;
    }
  }

  if (operationType === "Linear Facilities Operation") {
    switch (registrationPurpose) {
      case NEW_ENTRANT_REGISTRATION_PURPOSE:
        return ReportingFlow.NewEntrantLFO;
      case REPORTING_OPERATION:
        return ReportingFlow.ReportingOnlyLFO;
      default:
        return ReportingFlow.LFO;
    }
  }

  throw new Error(
    `Unable to resolve reporting flow for registration purpose ${registrationPurpose.registration_purpose} and operation type ${operationType}`,
  );
}
