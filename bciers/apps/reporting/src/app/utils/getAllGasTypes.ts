import { actionHandler } from "@bciers/actions";

export const getAllGasTypes = async () => {
  return actionHandler(`reporting/gas-type`, "GET", `reporting/gas-type`);
};
