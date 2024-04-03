import Operations from "@/app/components/routes/operations/Operations";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import createFetchMock from "vitest-fetch-mock";

const fetchMock = createFetchMock(vi);
fetchMock.enableMocks();

// Mock useFormStatus
vi.mock("react-dom", () => ({
  useFormStatus: jest.fn().mockReturnValue({ pending: false }),
}));

// TODO: Remove skip and fix this test
describe.skip("Operations component", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    fetchMock.enableMocks(); // Enable fetch mocking
  });
  it("renders the Operations grid", async () => {
    fetchMock.mockResponse(
      JSON.stringify([
        {
          id: 1,
          name: "Operation 1",
          type: "Single Facility Operation",
          naics_code: 1,
          previous_year_attributable_emissions: "100",
          swrs_facility_id: "1001",
          bcghg_id: "123",
          opt_in: false,
          operator: 1,
          status: "Not Started",
          reporting_activities: [],
          regulated_products: [],
          documents: [],
          contacts: [],
          operator_id: 1,
          naics_code_id: 1,
        },
        {
          id: 2,
          name: "Operation 2",
          type: "Type B",
          naics_code: 2,
          permit_issuing_agency: "authority",
          permit_number: "256",
          previous_year_attributable_emissions: null,
          swrs_facility_id: null,
          bcghg_id: null,
          opt_in: false,
          operator: 2,
          status: "Not Started",
          reporting_activities: [],
          regulated_products: [],
          documents: [],
          contacts: [],
          operator_id: 2,
          naics_code_id: 2,
        },
      ]),
    );
    render(await Operations());
    // Check if the grid of mock data is present
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.getByText(/Operation 2/i)).toBeVisible();
    // temporarily commented out because render only renders half the grid
    expect(screen.getAllByText(/not Started/i)).toHaveLength(2);
    expect(
      screen.getAllByRole("button", { name: /start registration/i }),
    ).toHaveLength(2);
  });
});
