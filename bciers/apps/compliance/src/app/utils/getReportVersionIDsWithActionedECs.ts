import { actionHandler } from "@bciers/actions";

const getReportVersionIDsWithActionedECs = async (): Promise<number[]> => {
  const response = await actionHandler(
    `compliance/compliance-earned-credit/report-version-ids`,
    "GET",
    "",
  );
  if ("error" in response) {
    console.error("Error field exists in response:", response.error);
  }
  return response;
};

export default getReportVersionIDsWithActionedECs;
