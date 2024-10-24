import { actionHandler } from "@bciers/actions";

async function getNaicsCodes() {
  return await actionHandler("registration/naics_codes", "GET", "");
}

export default getNaicsCodes;
