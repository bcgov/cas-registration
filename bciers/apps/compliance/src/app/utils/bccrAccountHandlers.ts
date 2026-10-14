"use server";

import {
  BccrAccountDetailsResponse,
  BccrComplianceAccountResponse,
} from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";

// Errors thrown from a server action have their message redacted in production builds,
// so catch on the server and return the message for the client to display.
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unknown error occurred";

export const getBccrAccountDetails = async (
  accountId: string,
  complianceReportVersionId: number,
): Promise<BccrAccountDetailsResponse> => {
  try {
    return await actionHandler(
      `compliance/bccr/accounts/${accountId}/compliance-report-versions/${complianceReportVersionId}`,
      "GET",
    );
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
};

export const getBccrComplianceUnits = async (
  accountId: string,
  complianceReportVersionId: number,
): Promise<BccrComplianceAccountResponse | { error: string }> => {
  try {
    return await actionHandler(
      `compliance/bccr/accounts/${accountId}/compliance-report-versions/${complianceReportVersionId}/compliance-units`,
      "GET",
      "",
    );
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
};
