import { actionHandler } from "@bciers/actions";

export const getAllEmissionCategories = async () => {
  const endpoint = "reporting/emission-category";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error("Failed to fetch the emission category.");
  }
  return response;
};
