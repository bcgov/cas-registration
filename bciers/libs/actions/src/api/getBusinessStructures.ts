import { actionHandler } from "@bciers/actions";

async function getBusinessStructures() {
  try {
    return await actionHandler("registration/business_structures", "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getBusinessStructures;
