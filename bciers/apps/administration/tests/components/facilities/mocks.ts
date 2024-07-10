const fetchFacilitiesPageData = vi.fn();
const getFacility = vi.fn();

vi.mock(
  "@/administration/app/components/facilities/fetchFacilitiesPageData",
  () => ({
    default: fetchFacilitiesPageData,
  }),
);

vi.mock("@/administration/app/components/facilities/getFacility", () => ({
  default: getFacility,
}));

export { fetchFacilitiesPageData, getFacility };
