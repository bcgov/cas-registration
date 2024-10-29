import { actionHandler } from "@bciers/actions";

export const getAllGasTypes = async () => {
  return actionHandler(`reporting/activities`, "GET", `reporting/gas-type`);
};
