import { actionHandler } from "@bciers/actions";

export const getAllActivities = async () => {
  const endpoint = "reporting/activities";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error("Failed to fetch the activities.");
  }
  return response;
};
