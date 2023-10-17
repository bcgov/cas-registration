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
          type: "Type A",
          naics_code: 1,
          naics_category: 1,
          reporting_activities: "Activity 1",
          permit_issuing_agency: "Agency 1",
          permit_number: "12345",
          previous_year_attributable_emissions: "100.34500",
          swrs_facility_id: "1001",
          bcghg_id: "546",
          current_year_estimated_emissions: null,
          opt_in: null,
          new_entrant: null,
          start_of_commercial_operation: null,
          physical_street_address: "123 Main St",
          physical_municipality: "Cityville",
          physical_province: "ON",
          physical_postal_code: "M1M 1M1",
          legal_land_description: "Lot 123, Concession 456",
          latitude: "45.67890",
          longitude: "-123.45678",
          npri_id: 12345,
          bcer_permit_id: 563,
          operator: 1,
          major_new_operation: null,
          verified_at: "2023-10-13",
          verified_by: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          status: "Not Registered",
          petrinex_ids: [],
          regulated_products: [],
          documents: [],
          contacts: [],
          operator_id: 1,
          naics_code_id: 1,
          naics_category_id: 1,
        },
        {
          id: 2,
          name: "Operation 2",
          type: "Type B",
          naics_code: 2,
          naics_category: 1,
          reporting_activities: "Activity 2",
          permit_issuing_agency: "authority",
          permit_number: "256",
          previous_year_attributable_emissions: null,
          swrs_facility_id: null,
          bcghg_id: null,
          current_year_estimated_emissions: "564.25000",
          opt_in: false,
          new_entrant: true,
          start_of_commercial_operation: "2023-10-13",
          physical_street_address: "789 Oak St",
          physical_municipality: "Villagetown",
          physical_province: "BC",
          physical_postal_code: "V3V 3V3",
          legal_land_description: "Parcel 789",
          latitude: "50.12345",
          longitude: "-110.98765",
          npri_id: 56,
          bcer_permit_id: 54321,
          operator: 2,
          major_new_operation: false,
          verified_at: null,
          verified_by: null,
          status: "Not Registered",
          petrinex_ids: [],
          regulated_products: [],
          documents: [],
          contacts: [],
          operator_id: 2,
          naics_code_id: 2,
          naics_category_id: 1,
        },
      ]),
    );

    render(await Operations());
    // Check if the grid of mock data is present
    await expect(screen.getByText(/Operation 1/i)).toBeVisible();
    await expect(screen.getByText(/Operation 2/i)).toBeVisible();
    await expect(screen.getByText(/not registered/i)).toHaveLength(2);
    await expect(
      screen.getByRole("button", { name: /start registration/i }),
    ).toHaveLength(2);
  });
});
