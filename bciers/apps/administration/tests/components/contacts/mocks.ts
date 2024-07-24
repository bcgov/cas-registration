const fetchContactsPageData = vi.fn();
const getContact = vi.fn();
const getUserOperatorUsers = vi.fn();

vi.mock(
  "apps/administration/app/components/contacts/fetchContactsPageData",
  () => ({
    default: fetchContactsPageData,
  }),
);

vi.mock("apps/administration/app/components/contacts/getContact", () => ({
  default: getContact,
}));

vi.mock(
  "apps/administration/app/components/contacts/getUserOperatorUsers",
  () => ({
    default: getUserOperatorUsers,
  }),
);

export { fetchContactsPageData, getContact, getUserOperatorUsers };
