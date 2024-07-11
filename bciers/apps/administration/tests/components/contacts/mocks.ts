const fetchContactsPageData = vi.fn();

vi.mock(
  "apps/administration/app/components/contacts/fetchContactsPageData",
  () => ({
    default: fetchContactsPageData,
  }),
);

export { fetchContactsPageData };
