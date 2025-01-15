import { actionHandler } from "@bciers/actions";

async function getFacilities(id: string) {
  return actionHandler(`registration/operations/${id}/facilities`, "GET", "");
}

export default getFacilities;
