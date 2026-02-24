import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch compliance period by reporting year
export default async function getCompliancePeriod(
  reporting_year: number,
  pathToRevalidate: string = "",
) {
  return actionHandler(
    `compliance/compliance-period/${reporting_year}`,
    "GET",
    pathToRevalidate,
  );
}
