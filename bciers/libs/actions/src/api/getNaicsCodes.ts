import { actionHandler } from "@bciers/actions";

async function getNaicsCodes() {
  return actionHandler("registration/v2/naics_codes", "GET", "");
}

export default getNaicsCodes;
