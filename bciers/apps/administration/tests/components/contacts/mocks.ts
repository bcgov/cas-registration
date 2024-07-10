const fetchContactsPageData = vi.fn();

vi.mock(
  "@/administration/app/components/contacts/fetchContactsPageData",
  () => ({
    default: fetchContactsPageData,
  }),
);

export { fetchContactsPageData };
