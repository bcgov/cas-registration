import { actionHandler } from "@bciers/actions";

export default async function getCurrentCompliancePenaltyRate() {
  const endpoint = `compliance/compliance-penalty-rate`;

  return actionHandler(endpoint, "GET");
}
