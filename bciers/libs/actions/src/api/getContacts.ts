import { actionHandler } from "@bciers/actions";

async function getContacts() {
  return await actionHandler(
    `registration/contacts?paginate_result=false`,
    "GET",
    "",
  );
}

export default getContacts;
