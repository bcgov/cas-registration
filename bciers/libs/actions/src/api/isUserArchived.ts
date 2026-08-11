import { actionHandler } from "@bciers/actions";

export default async function isUserArchived() {
  return actionHandler("registration/user/user-is-archived", "GET");
}
