import { actionHandler } from "@bciers/actions";

export const getAllGasTypes = async () => {
  return actionHandler(`reporting/gas-type`, "GET", `reporting/gas-type`);
};

export const getBasicGasTypes = async () => {
  return actionHandler(
    `reporting/basic-gas-types`,
    "GET",
    `reporting/basic-gas-types`,
  );
};
