"use server";

import {
  BccrAccountDetailsResponse,
  BccrComplianceAccountResponse,
  BccrErrorResponse,
} from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";

// Errors thrown from a server action are redacted in production builds
// (Minified React error #441), so catch them here on the server and return
// the message as data for the client to display
const toErrorResponse = (error: unknown): BccrErrorResponse => ({
  error:
    error instanceof Error ? error.message : "An unexpected error occurred.",
});

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
    return toErrorResponse(error);
  }
};

export const getBccrComplianceUnits = async (
  accountId: string,
  complianceReportVersionId: number,
): Promise<BccrComplianceAccountResponse | BccrErrorResponse> => {
  try {
    return await actionHandler(
      `compliance/bccr/accounts/${accountId}/compliance-report-versions/${complianceReportVersionId}/compliance-units`,
      "GET",
      "",
    );
  } catch (error) {
    return toErrorResponse(error);
  }
};
