import { actionHandler } from "@bciers/actions";

async function getRegistrationPurposes() {
  return actionHandler("registration/registration_purposes", "GET", "");
}

export default getRegistrationPurposes;
