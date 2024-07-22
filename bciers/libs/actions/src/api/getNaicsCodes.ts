import { actionHandler } from "@bciers/actions";

async function getNaicsCodes() {
  try {
    return await actionHandler("registration/naics_codes", "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getNaicsCodes;
