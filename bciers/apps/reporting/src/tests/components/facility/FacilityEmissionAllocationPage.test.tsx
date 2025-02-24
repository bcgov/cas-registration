import { render, screen, waitFor } from "@testing-library/react";
import FacilityEmissionAllocationPage from "@reporting/src/app/components/facility/FacilityEmissionAllocationPage";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getEmissionAllocations } from "@reporting/src/app/utils/getEmissionAllocations";

// ✨ Mocks
vi.mock("@reporting/src/app/utils/getReportInformationTaskListData", () => ({
  getReportInformationTasklist: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getOrderedActivities", () => ({
  getOrderedActivities: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getEmissionAllocations", () => ({
  getEmissionAllocations: vi.fn(),
}));

// 🏷 Constants
const mockVersionId = 3;
const mockFacilityId = "abc3";
const mockReportTaskList = {
  facilityName: "Test Facility",
  operationType: "SFO",
};
const orderedActivities = [
  {
    id: 1,
    name: "General stationary combustion excluding line tracing",
    slug: "gsc_excluding_line_tracing",
  },
  { id: 5, name: "Ammonia production", slug: "ammonia_production" },
  { id: 17, name: "Lime manufacturing", slug: "lime_manufacturing" },
];
const emissionAllocations = {
  report_product_emission_allocations: [
    {
      emission_category: "flaring",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 0,
    },
    {
      emission_category: "fugitive",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 10,
        },
      ],
      emission_total: 10,
    },
    {
      emission_category: "industrial_process",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 20,
        },
      ],
      emission_total: 200,
    },
    {
      emission_category: "onsite",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 400,
    },
    {
      emission_category: "stationary",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 500,
    },
    {
      emission_category: "venting_useful",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 600,
    },
    {
      emission_category: "venting_non_useful",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 700,
    },
    {
      emission_category: "waste",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 800,
    },
    {
      emission_category: "wastewater",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 900,
    },
    {
      emission_category: "woody_biomass",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 100,
        },
      ],
      emission_total: 1000,
    },
    {
      emission_category: "excluded_biomass",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 20,
    },
    {
      emission_category: "excluded_non_biomass",
      products: [
        {
          product_id: 1,
          product_name: "BC-specific refinery complexity throughput",
          product_emission: 0,
        },
      ],
      emission_total: 50,
    },
  ],
};
describe("The FacilityEmissionAllocationPage component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("renders the FacilityEmissionAllocationForm", async () => {
    (
      getReportInformationTasklist as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockReportTaskList);
    (getOrderedActivities as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      orderedActivities,
    );
    (getEmissionAllocations as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      emissionAllocations,
    );
    // Render the page with the `versionId` prop
    render(
      await FacilityEmissionAllocationPage({
        version_id: mockVersionId,
        facility_id: mockFacilityId,
      }),
    );

    // Assert the FacilityEmissionAllocationForm is rendered
    await waitFor(() => {
      const txt = screen.getAllByText(/Allocation of Emissions/i)[0];
      expect(txt).toBeInTheDocument();
      expect(txt).toBeVisible();
    });
  });
});
