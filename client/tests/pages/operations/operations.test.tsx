import Page from "@/app/operations/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

// const mockGetOperations = jest.spyOn(
//   require("../../../app/operations/page"),
//   "getOperations"
// );
describe("operations page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    fetchMock.enableMocks(); // Enable fetch mocking
  });
  it("renders the Operations List page", async () => {
    fetchMock.mockResponse(
      JSON.stringify([
        {
          id: 1,
          operator_id: 1,
          name: "Operation 1",
          operation_type: "string",
          naics_code_id: 1,
          eligible_commercial_product_name: "string",
          permit_id: "string",
          npr_id: "string",
          ghfrp_id: "string",
          bcghrp_id: "string",
          petrinex_id: "string",
          latitude: "0.11111",
          longitude: "0.11111",
          legal_land_description: "string",
          nearest_municipality: "string",
          operator_percent_of_ownership: "0.11111",
          registered_for_obps: true,
          estimated_emissions: "0.11111",
        },
        {
          id: 2,
          operator_id: 1,
          name: "Operation 2",
          operation_type: "string",
          naics_code_id: 1,
          eligible_commercial_product_name: "string",
          permit_id: "string",
          npr_id: "string",
          ghfrp_id: "string",
          bcghrp_id: "string",
          petrinex_id: "string",
          latitude: "0.11111",
          longitude: "0.11111",
          legal_land_description: "string",
          nearest_municipality: "string",
          operator_percent_of_ownership: "0.11111",
          registered_for_obps: true,
          estimated_emissions: "0.11111",
        },
      ]),
    );

    render(await Page());

    // Check if the "Add Operation" button is present and has the correct text
    expect(
      screen.getByRole("button", {
        name: /add operation/i,
      }),
    ).toBeVisible();

    // Check if the data grid is present
    expect(screen.getByRole("grid")).toBeVisible();
    screen.logTestingPlaygroundURL();
    await expect(screen.getByText(/Operation 1/i)).toBeVisible();
    await expect(screen.getByText(/Operation 2/i)).toBeVisible();
    await expect(
      screen.getByRole("button", { name: /view details/i }),
    ).toHaveLength(2);
  });
});
