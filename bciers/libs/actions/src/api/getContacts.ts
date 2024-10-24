import { actionHandler } from "@bciers/actions";

async function getContacts() {
  const response = await actionHandler(
    `registration/contacts?paginate_result=false`,
    "GET",
    "",
  );
  return response;
}

export default getContacts;
