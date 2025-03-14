import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import { dummyNavigationInformation } from "../taskList/utils";

// ✨ Mocks
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

// 🏷 Constants
const config = {
  buttons: {
    cancel: "Back",
    saveAndContinue: "Save & Continue",
  },
  mockVersionId: 3,
  mockFacilityId: "abc",
  mockRouteSubmit: `additional-reporting-data?facility_id=$abc`,
};
const mockInitialData = {
  allocation_methodology: "Other",
  allocation_other_methodology_description: "description",
  report_product_emission_allocations: [
    {
      category_type: "basic",
      emission_total: 100,
      products: [
        {
          allocated_quantity: 40,
          report_product_id: 1,
          product_name: "Product 1",
        },
        {
          allocated_quantity: 60,
          report_product_id: 2,
          product_name: "Product 2",
        },
      ],
    },
    {
      category_type: "fuel_excluded",
      emission_total: 50,
      products: [
        {
          allocated_quantity: 25,
          report_product_id: 1,
          product_name: "Product 1",
        },
        {
          allocated_quantity: 25,
          report_product_id: 2,
          product_name: "Product 2",
        },
      ],
    },
  ],
  facility_total_emissions: 150,
  report_product_emission_allocation_totals: [
    {
      report_product_id: 1,
      product_name: "Cement equivalent",
      allocated_quantity: "65.0000",
    },
    {
      report_product_id: 2,
      product_name: "Gypsum wallboard",
      allocated_quantity: "85.0000",
    },
  ],
};

// ⛏️ Helper function to simulate form POST submission and assert the result
const submitFormAndAssert = async () => {
  actionHandler.mockReturnValueOnce({
    success: true,
  });
  const button = screen.getByRole("button", {
    name: config.buttons.saveAndContinue,
  });
  await waitFor(() => {
    expect(button).toBeEnabled();
  });
  fireEvent.click(button);

  await waitFor(() => {
    expect(screen.queryByText(/Required field/i)).not.toBeInTheDocument();
    // Assert expected behavior after submission
    // expect(actionHandler).toHaveBeenCalledTimes(1);
    // expect(mockRouterPush).toHaveBeenCalledTimes(1);
    // expect(mockRouterPush).toHaveBeenCalledWith(config.mockRouteSubmit);
  });
};

// 🧪 Test suite
describe("FacilityEmissionAllocationForm component", () => {
  it("renders the form with initial data", () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(screen.getByText(/Other/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Product 1/i)).toHaveLength(2);
    expect(screen.getAllByText(/Product 2/i)).toHaveLength(2);
  });
  it("disables the submit button if emission allocation validation fails", () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id="facility-123"
        orderedActivities={[]}
        initialData={{
          ...mockInitialData,
          report_product_emission_allocations: [
            {
              category_type: "basic",
              emission_total: 100,
              products: [
                {
                  allocated_quantity: 50,
                  report_product_id: 1,
                  product_name: "Product 1",
                },
                {
                  allocated_quantity: 30,
                  report_product_id: 2,
                  product_name: "Product 2",
                },
              ],
            },
          ],
        }}
        navigationInformation={dummyNavigationInformation}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: config.buttons.saveAndContinue,
      }),
    ).toBeDisabled();
  });
  it("enables the submit button when all emissions are allocated correctly", async () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: config.buttons.saveAndContinue,
        }),
      ).toBeEnabled();
    });
  });
  it(
    "submits successfully",
    {
      timeout: 10000,
    },
    async () => {
      render(
        <FacilityEmissionAllocationForm
          version_id={config.mockVersionId}
          facility_id={config.mockFacilityId}
          orderedActivities={[]}
          initialData={mockInitialData}
          navigationInformation={dummyNavigationInformation}
        />,
      );
      // POST submit and assert the result
      await submitFormAndAssert();
    },
  );
  it("routes to the production data page when the Back button is clicked", () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    // Click the "Back" button
    const backButton = screen.getByRole("button", {
      name: config.buttons.cancel,
    });
    fireEvent.click(backButton);

    // Assert that the router's push method was called with the expected route
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith("back");
  });
});
