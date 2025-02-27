import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
<<<<<<< HEAD
import { dummyNavigationInformation } from "../taskList/utils";
=======
import { OperationTypes } from "@bciers/utils/src/enums";
import userEvent from "@testing-library/user-event";
>>>>>>> 55a8703bf (chore: Add not applicable as an option to allocation of emission page IF small or medium facility + tests)

// ✨ Mocks
const mockRouterPush = vi.fn();
const mockRouterRefresh = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
  refresh: mockRouterRefresh,
});

// 🏷 Constants
const config = {
  buttons: {
    cancel: "Back",
    saveAndContinue: "Save & Continue",
  },
  mockVersionId: 3,
  mockFacilityId: "abc",
  mockRouteSubmit: `additional-reporting-data`,
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
<<<<<<< HEAD
        navigationInformation={dummyNavigationInformation}
=======
        taskListElements={[]}
        operationType={OperationTypes.LFO}
        facilityType=""
>>>>>>> 55a8703bf (chore: Add not applicable as an option to allocation of emission page IF small or medium facility + tests)
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
<<<<<<< HEAD
        navigationInformation={dummyNavigationInformation}
=======
        taskListElements={[]}
        operationType={OperationTypes.LFO}
        facilityType="Large Facility"
>>>>>>> 55a8703bf (chore: Add not applicable as an option to allocation of emission page IF small or medium facility + tests)
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
<<<<<<< HEAD
        navigationInformation={dummyNavigationInformation}
=======
        taskListElements={[]}
        operationType={OperationTypes.LFO}
        facilityType="Large Facility"
>>>>>>> 55a8703bf (chore: Add not applicable as an option to allocation of emission page IF small or medium facility + tests)
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
<<<<<<< HEAD
          navigationInformation={dummyNavigationInformation}
=======
          taskListElements={[]}
          operationType={OperationTypes.LFO}
          facilityType="Large Facility"
>>>>>>> 55a8703bf (chore: Add not applicable as an option to allocation of emission page IF small or medium facility + tests)
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
<<<<<<< HEAD
        navigationInformation={dummyNavigationInformation}
=======
        taskListElements={[]}
        operationType={OperationTypes.LFO}
        facilityType="Large Facility"
>>>>>>> 55a8703bf (chore: Add not applicable as an option to allocation of emission page IF small or medium facility + tests)
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

  it("renders a Not Applicable option for methodology if report type is small or medium", async () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        taskListElements={[]}
        operationType={"Linear Facility Operation"}
        facilityType={"Small Aggregate"}
      />,
    );

    await waitFor(() => {
      const txt = screen.getAllByText(/Allocation of Emissions/i)[0];
      expect(txt).toBeInTheDocument();
      expect(txt).toBeVisible();
    });
    await userEvent.click(
      screen.getByRole("combobox", { name: /root_allocation_methodology/i }),
    );
    const methodology = screen.getAllByText(/Not Applicable/i)[0];
    expect(methodology).toBeInTheDocument();
    expect(methodology).toBeVisible();
  });
});
