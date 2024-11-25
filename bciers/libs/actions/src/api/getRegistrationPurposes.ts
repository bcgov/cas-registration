import { actionHandler } from "@bciers/actions";

async function getRegistrationPurposes() {
  return actionHandler(
    "registration/v2/operations/registration-purposes",
    "GET",
    "",
  );
}

export default getRegistrationPurposes;
