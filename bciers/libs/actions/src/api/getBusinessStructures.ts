import { actionHandler } from "@bciers/actions";

async function getBusinessStructures() {
  const response = await actionHandler(
    "registration/business_structures",
    "GET",
    "",
  );
  return response;
}

export default getBusinessStructures;
