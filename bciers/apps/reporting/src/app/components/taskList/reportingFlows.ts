import {
  ELECTRICITY_IMPORT_OPERATION,
  NEW_ENTRANT_REGISTRATION_PURPOSE,
  REPORTING_OPERATION,
} from "../../utils/constants";
import { getRegistrationPurpose } from "../../utils/getRegistrationPurpose";
import { getReportingOperation } from "../../utils/getReportingOperation";
import { lfoFlow } from "./reportingFlows/lfoFlow";
import { lfoNewEntrantFlow } from "./reportingFlows/lfoNewEntrantFlow";
import { lfoReportingOnlyFlow } from "./reportingFlows/lfoReportingOnlyFlow";
import { sfoFlow } from "./reportingFlows/sfoFlow";
import { sfoNewEntrantFlow } from "./reportingFlows/sfoNewEntrantFlow";
import { sfoReportingOnlyFlow } from "./reportingFlows/sfoReportingOnlyFlow";
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
};

export async function getFlow(reportVersionId: number): Promise<ReportingFlow> {
  const reportOperationData = await getReportingOperation(reportVersionId);
  const registrationPurpose = (await getRegistrationPurpose(reportVersionId))
    .registration_purpose;

  const operationType = reportOperationData.operation_type;

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

/**
 * Retrieves the ReportingFlowDescription corresponding to the report version.
 * It calls getFlow to get the ReportingFlow and then uses that key to look up
 * the appropriate description from the reportingFlows mapping.
 *
 * @param reportVersionId - The ID of the report version.
 * @returns A Promise that resolves to a ReportingFlowDescription.
 * @throws Error if no mapping is found for the determined flow.
 */
export async function getFlowData(
  reportVersionId: number,
): Promise<ReportingFlowDescription> {
  // Determine the flow for the provided report version ID.
  const flow = await getFlow(reportVersionId);
  // Retrieve the corresponding ReportingFlowDescription from the mapping.
  const flowData = reportingFlows[flow] as ReportingFlowDescription;

  // If no description is found, throw an error.
  if (!flowData) {
    throw new Error(`No ReportingFlowDescription found for flow: ${flow}`);
  }

  return flowData;
}
