import { actionHandler } from "@bciers/actions";

export async function getReportNeedsVerification(versionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/report-needs-verification`,
    "GET",
    "",
  );
  if (response.error) {
    throw new Error(
      "We couldn't find the verification requirement for this report.",
    );
  }
  return response;
}
