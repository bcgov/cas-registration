import { actionHandler } from "@bciers/actions";

async function getRegistrationPurposes() {
  try {
    return await actionHandler("registration/registration_purposes", "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getRegistrationPurposes;
