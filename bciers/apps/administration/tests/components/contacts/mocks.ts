const fetchContactsPageData = vi.fn();

vi.mock(
  "apps/registration/app/components/contacts/fetchContactsPageData",
  () => ({
    default: fetchContactsPageData,
  }),
);

export { fetchContactsPageData };
