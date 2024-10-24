import { actionHandler } from "@bciers/actions";

async function getBusinessStructures() {
  return await actionHandler("registration/business_structures", "GET", "");
}

export default getBusinessStructures;
