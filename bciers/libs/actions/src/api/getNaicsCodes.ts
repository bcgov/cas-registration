import { actionHandler } from "@bciers/actions";

async function getNaicsCodes() {
  const response = await actionHandler("registration/naics_codes", "GET", "");
  return response;
}

export default getNaicsCodes;
