import { actionHandler } from "@bciers/actions";

async function getRegistrationPurposes() {
  return actionHandler(
    "registration/operations/registration-purposes",
    "GET",
    "",
  );
}

export default getRegistrationPurposes;
