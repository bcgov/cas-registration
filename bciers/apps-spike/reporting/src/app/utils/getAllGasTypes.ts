import { actionHandler } from "@bciers/actions";

export const getAllGasTypes = async () => {
  const endpoint = "reporting/gas-type";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error("Failed to fetch the gas types.");
  }
  return response;
};

export const getBasicGasTypes = async () => {
  const endpoint = "reporting/basic-gas-types";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error("Failed to fetch the basic gas types.");
  }
  return response;
};
