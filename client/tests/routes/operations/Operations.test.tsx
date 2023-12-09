import Operations from "@/app/components/routes/operations/Operations";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

describe("Operations component", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
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
          bcghg_id: "546",
          opt_in: false,
          operator: 1,
          verified_at: "2023-10-13",
          verified_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          status: "Not Registered",
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
          verified_at: null,
          verified_by: null,
          status: "Not Registered",
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
    await expect(screen.getByText(/Operation 1/i)).toBeVisible();
    await expect(screen.getByText(/Operation 2/i)).toBeVisible();
    // temporarily commented out because render only renders half the grid
    await expect(screen.getAllByText(/not registered/i)).toHaveLength(2);
    await expect(
      screen.getAllByRole("button", { name: /start registration/i }),
    ).toHaveLength(2);
  });
});
