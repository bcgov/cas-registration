import { actionHandler } from "@bciers/actions";

async function getRegistrationPurposes() {
  const response = await actionHandler(
    "registration/registration_purposes",
    "GET",
    "",
  );
  return response;
}

export default getRegistrationPurposes;
