"use server";

import {
  BccrAccountDetailsResponse,
  BccrComplianceAccountResponse,
  BccrErrorResponse,
} from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";

// Errors thrown from a server action have their message redacted in production
// builds (Minified React error #441), so catch them on the server and return
// the message as `{ error }` for handleApiResponse to display. The HTTP status
// (attached by actionHandler) is kept so callers can tell server errors apart
const toErrorResponse = (error: unknown): BccrErrorResponse => {
  if (!(error instanceof Error))
    return { error: "An unexpected error occurred." };

  const { status } = error as Error & { status?: number };
  return { error: error.message, ...(status ? { status } : {}) };
};

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
