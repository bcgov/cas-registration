import { actionHandler } from "@bciers/actions";

export async function getAllActivities() {
  const endpoint = "reporting/activities";
  const response = await actionHandler(endpoint, "GET");
  if (response.error) {
    throw new Error("Failed to fetch the activities.");
  }
  return response;
}
