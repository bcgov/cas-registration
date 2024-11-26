import { actionHandler } from "@bciers/actions";

async function getContacts() {
  return actionHandler(
    `registration/v2/contacts?paginate_result=false`,
    "GET",
    "",
  );
}

export default getContacts;
