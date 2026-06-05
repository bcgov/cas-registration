import { actionHandler } from "@bciers/actions";
import { Activity } from "@reporting/src/app/components//operations/types";

export async function getAllActivities() {
  const endpoint = "reporting/activities";
  const response = await actionHandler(endpoint, "GET");

  return response as Activity[];
}
