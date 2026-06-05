import { actionHandler } from "@bciers/actions";

export const getAllGasTypes = async () => {
  const endpoint = "reporting/gas-type";
  const response = await actionHandler(endpoint, "GET");

  return response;
};

export const getBasicGasTypes = async () => {
  const endpoint = "reporting/basic-gas-types";
  const response = await actionHandler(endpoint, "GET");

  return response;
};
