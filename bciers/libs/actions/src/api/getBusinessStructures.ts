import { actionHandler } from "@bciers/actions";

async function getBusinessStructures() {
  return actionHandler(`registration/v2/business_structures`, "GET", ``);
}

export default getBusinessStructures;
