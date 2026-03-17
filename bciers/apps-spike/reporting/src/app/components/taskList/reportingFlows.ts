import {
  ELECTRICITY_IMPORT_OPERATION,
  NEW_ENTRANT_REGISTRATION_PURPOSE,
  OPTED_IN_OPERATION,
  POTENTIAL_REPORTING_OPERATION,
  REPORTING_OPERATION,
} from "../../utils/constants";
import { getRegistrationPurpose } from "../../utils/getRegistrationPurpose";
import { getReportingOperation } from "../../utils/getReportingOperation";
import { lfoFlow } from "@reporting/src/app/components/taskList/reportingFlow/lfoFlow";
import { lfoNewEntrantFlow } from "@reporting/src/app/components/taskList/reportingFlow/lfoNewEntrantFlow";
import { lfoReportingOnlyFlow } from "@reporting/src/app/components/taskList/reportingFlow/lfoReportingOnlyFlow";
import { sfoFlow } from "@reporting/src/app/components/taskList/reportingFlow/sfoFlow";
import { sfoNewEntrantFlow } from "@reporting/src/app/components/taskList/reportingFlow/sfoNewEntrantFlow";
import { sfoReportingOnlyFlow } from "@reporting/src/app/components/taskList/reportingFlow/sfoReportingOnlyFlow";
import { eioFlow } from "@reporting/src/app/components/taskList/reportingFlow/eioFlow";
import { ReportingFlow, ReportingFlowDescription } from "./types";

export const reportingFlows: {
  [Flow in ReportingFlow]?: ReportingFlowDescription;
} = {
  [ReportingFlow.EIO]: eioFlow,
  [ReportingFlow.SFO]: sfoFlow,
  [ReportingFlow.LFO]: lfoFlow,
  [ReportingFlow.NewEntrantLFO]: lfoNewEntrantFlow,
  [ReportingFlow.NewEntrantSFO]: sfoNewEntrantFlow,
  [ReportingFlow.ReportingOnlySFO]: sfoReportingOnlyFlow,
  [ReportingFlow.ReportingOnlyLFO]: lfoReportingOnlyFlow,
};

/**
 * Resolves the appropriate ReportingFlow based on operation type and registration purpose.
 * Optionally includes new cases like POTENTIAL_REPORTING_OPERATION and OPTED_IN_OPERATION.
 *
 * @param operationType - The type of operation ("Single Facility Operation" or "Linear Facilities Operation").
 * @param registrationPurpose - The registration purpose of the report.
 * @param includeNewCases - Whether to include the new flows for POTENTIAL_REPORTING_OPERATION and OPTED_IN_OPERATION.
 * @returns The corresponding ReportingFlow enum value.
 * @throws Error if the operation type or registration purpose cannot be resolved.
 */
function resolveFlow(
  operationType: string,
  registrationPurpose: string,
  includeNewCases = false,
): ReportingFlow {
  if (registrationPurpose === ELECTRICITY_IMPORT_OPERATION)
    return ReportingFlow.EIO;

  // Single Facility Operation
  if (operationType === "Single Facility Operation") {
    if (includeNewCases) {
      if (registrationPurpose === POTENTIAL_REPORTING_OPERATION)
        return ReportingFlow.PotentialReportingSFO;
      if (registrationPurpose === OPTED_IN_OPERATION)
        return ReportingFlow.OptedInSFO;
    }
    switch (registrationPurpose) {
      case NEW_ENTRANT_REGISTRATION_PURPOSE:
        return ReportingFlow.NewEntrantSFO;
      case REPORTING_OPERATION:
        return ReportingFlow.ReportingOnlySFO;
      default:
        return ReportingFlow.SFO;
    }
  }

  // Linear Facilities Operation
  if (operationType === "Linear Facilities Operation") {
    if (includeNewCases) {
      if (registrationPurpose === POTENTIAL_REPORTING_OPERATION)
        return ReportingFlow.PotentialReportingLFO;
      if (registrationPurpose === OPTED_IN_OPERATION)
        return ReportingFlow.OptedInLFO;
    }
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
    `Unable to resolve reporting flow for registration purpose ${registrationPurpose} and operation type ${operationType}`,
  );
}

/**
 * Retrieves the ReportingFlow for a given report version.
 * This function only returns the original flows (does not include new cases like POTENTIAL_REPORTING_OPERATION or OPTED_IN_OPERATION).
 *
 * @param reportVersionId - The ID of the report version.
 * @returns A Promise that resolves to a ReportingFlow value.
 */
export async function getFlow(reportVersionId: number): Promise<ReportingFlow> {
  const reportOperationData = await getReportingOperation(reportVersionId);
  const registrationPurpose = (await getRegistrationPurpose(reportVersionId))
    .registration_purpose;

  // No new cases included
  return resolveFlow(reportOperationData.operation_type, registrationPurpose);
}

/**
 * Retrieves the ReportingFlow for a given report version, including new flows
 * such as POTENTIAL_REPORTING_OPERATION and OPTED_IN_OPERATION.
 *
 * @param reportVersionId - The ID of the report version.
 * @returns A Promise that resolves to a ReportingFlow value, including new cases.
 */
export async function getFlowWithNewCases(
  reportVersionId: number,
): Promise<ReportingFlow> {
  const reportOperationData = await getReportingOperation(reportVersionId);
  const registrationPurpose = (await getRegistrationPurpose(reportVersionId))
    .registration_purpose;

  // New cases handled via includeNewCases = true
  return resolveFlow(
    reportOperationData.operation_type,
    registrationPurpose,
    true,
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
