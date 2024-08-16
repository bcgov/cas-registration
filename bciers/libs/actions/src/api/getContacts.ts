import { actionHandler } from "@bciers/actions";

async function getContacts() {
  try {
    return await actionHandler(
      `registration/contacts?paginate_result=false`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
}

export default getContacts;
