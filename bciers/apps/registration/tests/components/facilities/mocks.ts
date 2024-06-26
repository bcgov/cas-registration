const fetchFacilitiesPageData = vi.fn();
vi.mock(
  "apps/registration/app/components/facilities/fetchFacilitiesPageData",
  () => ({
    default: fetchFacilitiesPageData,
  }),
);

export { fetchFacilitiesPageData };
