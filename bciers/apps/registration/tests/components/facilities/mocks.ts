const fetchFacilitiesPageData = vi.fn();
const getFacility = vi.fn();

vi.mock(
  "apps/registration/app/components/facilities/fetchFacilitiesPageData",
  () => ({
    default: fetchFacilitiesPageData,
  }),
);

vi.mock("apps/registration/app/components/facilities/getFacility", () => ({
  default: getFacility,
}));

export { fetchFacilitiesPageData, getFacility };
