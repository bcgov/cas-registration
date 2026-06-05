import { actionHandler } from "@bciers/actions";

export const getAllEmissionCategories = async () => {
  const endpoint = "reporting/emission-category";
  const response = await actionHandler(endpoint, "GET");

  return response;
};
