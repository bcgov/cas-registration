import { actionHandler } from "@bciers/actions";

async function getRegistrationPurposes() {
  return await actionHandler("registration/registration_purposes", "GET", "");
}

export default getRegistrationPurposes;
