/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";

const fetchContacts = () => {
  makeRequest(
    "GET",
    `${SERVER_HOST}/contacts`,
    null,
    getUserParams("cas_admin"),
    200,
    "Contact retrieval failed",
  );
};

const createContact = () => {
  const payload = JSON.stringify({
    first_name: "John",
    last_name: "Doe",
    email: "john.doe@email.test",
    phone_number: "+16044011234",
    position_title: "Test Position",
    street_address: "123 Main St",
    municipality: "Testville",
    province: "ON",
    postal_code: "A1A 1A1",
  });

  const res = makeRequest(
    "POST",
    `${SERVER_HOST}/contacts`,
    payload,
    getUserParams("industry_user_admin"),
    201,
    "Contact creation failed",
  );
  return res ? JSON.parse(res.body).id : fail("Contact creation failed");
};

const updateContact = (contactId) => {
  if (!contactId) return fail("No contact ID provided for PUT request");

  const payload = JSON.stringify({
    first_name: "Jane",
    last_name: "Doe",
    email: "jane.doe@email.test",
    phone_number: "+16044023456",
    position_title: "Updated Test Position",
    street_address: "321 Main St",
    municipality: "Updated Testville",
    province: "BC",
    postal_code: "H0H 0H0",
  });

  makeRequest(
    "PUT",
    `${SERVER_HOST}/contacts/${contactId}`,
    payload,
    getUserParams("industry_user_admin"),
    200,
    `Contact update failed`,
  );
};

export default function () {
  fetchContacts();
  const newContactId = createContact();
  updateContact(newContactId);
}
