const fetchContactsPageData = vi.fn();
const getContact = vi.fn();
const getUserOperatorUsers = vi.fn();
const getContacts = vi.fn();

vi.mock(
  "apps/administration/app/components/contacts/fetchContactsPageData",
  () => ({
    default: fetchContactsPageData,
  }),
);

vi.mock("libs/actions/src/api/getContact", () => ({
  default: getContact,
}));

vi.mock(
  "apps/administration/app/components/contacts/getUserOperatorUsers",
  () => ({
    default: getUserOperatorUsers,
  }),
);

vi.mock("libs/actions/src/api/getContacts", () => ({
  default: getContacts,
}));

export { fetchContactsPageData, getContact, getUserOperatorUsers, getContacts };
