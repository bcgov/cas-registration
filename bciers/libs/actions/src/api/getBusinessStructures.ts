import { actionHandler } from "@bciers/actions";

async function getBusinessStructures() {
  return actionHandler(`registration/business_structures`, "GET", ``);
}

export default getBusinessStructures;
