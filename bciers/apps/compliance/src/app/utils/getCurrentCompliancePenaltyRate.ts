import { actionHandler } from "@bciers/actions";

export default async function getCurrentCompliancePenaltyRate() {
  return actionHandler(`compliance/compliance-penalty-rate`, "GET");
}
