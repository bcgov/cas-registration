import { actionHandler } from "@bciers/actions";

export async function getAttributableEmissions(versionId: number) {
  const response = await actionHandler(
    `reporting/report-version/${versionId}/attributable-emissions`,
    "GET",
    "",
  );
  if (response.error) {
    throw new Error(
      "We couldn't find the attributable emissions for this report.",
    );
  }
  return response;
}
