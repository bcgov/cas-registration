import { actionHandler } from "@bciers/actions";

export const getAllActivities = async () => {
  const endpoint = "reporting/activities";
  const response = await actionHandler(endpoint, "GET");

  return response;
};
