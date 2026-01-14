import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import FacilityEmissionAllocationForm from "@reporting/src/app/components/facility/FacilityEmissionAllocationForm";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import { dummyNavigationInformation } from "../taskList/utils";
import userEvent from "@testing-library/user-event";
import { EmissionAllocationResponse } from "@reporting/src/app/utils/getEmissionAllocations";

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
    continue: "Continue",
  },
  mockVersionId: 3,
  mockFacilityId: "abc",
  mockRouteSubmit: `additional-reporting-data`,
};
const mockInitialData: EmissionAllocationResponse = {
  allocation_methodology: "Other",
  allocation_other_methodology_description: "description",
  report_product_emission_allocations: [
    {
      category_type: "basic",
      emission_total: "100",
      products: [
        {
          allocated_quantity: "40",
          report_product_id: 1,
          product_name: "Product 1",
        },
        {
          allocated_quantity: "60",
          report_product_id: 2,
          product_name: "Product 2",
        },
      ],
    },
    {
      category_type: "fuel_excluded",
      emission_total: "50",
      products: [
        {
          allocated_quantity: "24.0005",
          report_product_id: 1,
          product_name: "Product 1",
        },
        {
          allocated_quantity: "25.9995",
          report_product_id: 2,
          product_name: "Product 2",
        },
      ],
    },
  ],
  facility_total_emissions: 150.0,
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
  has_missing_products: false,
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
    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    // expect(mockRouterPush).toHaveBeenCalledWith(config.mockRouteSubmit);
  });
};

// 🧪 Test suite
describe("FacilityEmissionAllocationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the form with initial data", () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        navigationInformation={dummyNavigationInformation}
        facilityType=""
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
      />,
    );

    // Check that the methodology field has "Other" as its value (in the Autocomplete input)
    const methodologyField = screen.getByTestId("root_allocation_methodology");
    const methodologyInput = methodologyField.querySelector(
      'input[role="combobox"]',
    ) as HTMLInputElement;
    expect(methodologyInput).toHaveValue("Other");
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
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        facilityType={""}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: config.buttons.continue,
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
        facilityType="Large Facility"
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
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
          facilityType="Large Facility"
          isPulpAndPaper={false}
          overlappingIndustrialProcessEmissions={0}
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
        facilityType="Large Facility"
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
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

  it("renders a Not Applicable option for methodology", async () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        facilityType={""}
        navigationInformation={{
          taskList: [],
          continueUrl: "",
          backUrl: "",
          headerSteps: [],
          headerStepIndex: 0,
        }}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
      />,
    );

    // Get the methodology field and its input
    const methodologyField = screen.getByTestId("root_allocation_methodology");
    const methodologyInput = methodologyField.querySelector(
      'input[role="combobox"]',
    ) as HTMLElement;

    // Open the dropdown
    fireEvent.mouseDown(methodologyInput);

    // Wait for the "Not Applicable" option to appear
    await waitFor(() => {
      const methodology = screen.getByRole("option", {
        name: /Not Applicable/i,
      });
      expect(methodology).toBeInTheDocument();
      expect(methodology).toBeVisible();
    });
  });

  it("does not render a Not Applicable option for methodology if operation type is SFO", async () => {
    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        facilityType=""
        navigationInformation={{
          taskList: [],
          continueUrl: "",
          backUrl: "",
          headerSteps: [],
          headerStepIndex: 0,
        }}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        operationType="Single Facility Operation"
      />,
    );

    // Get the methodology field and its input
    const methodologyField = screen.getByTestId("root_allocation_methodology");
    const methodologyInput = methodologyField.querySelector(
      'input[role="combobox"]',
    ) as HTMLElement;

    // Open the dropdown
    fireEvent.mouseDown(methodologyInput);

    // Wait for options to appear, then verify "Not Applicable" is not among them
    await waitFor(() => {
      const methodology = screen.queryByRole("option", {
        name: /Not Applicable/i,
      });
      expect(methodology).toBeNull();
    });
  });

  it("renders a warning if there are missing products", async () => {
    const initialData = {
      ...mockInitialData,
      has_missing_products: true,
    };

    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={initialData}
        facilityType=""
        navigationInformation={{
          taskList: [],
          continueUrl: "",
          backUrl: "",
          headerSteps: [],
          headerStepIndex: 0,
        }}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        operationType="Single Facility Operation"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      /To allocate emissions to a product that isn't shown below, return to the production data page and select it first./i,
    );
  });

  it("clears products when methodology is changed to 'Not Applicable' and restores them when changed back", async () => {
    const user = userEvent.setup();

    render(
      <FacilityEmissionAllocationForm
        version_id={config.mockVersionId}
        facility_id={config.mockFacilityId}
        orderedActivities={[]}
        initialData={mockInitialData}
        facilityType=""
        navigationInformation={{
          taskList: [],
          continueUrl: "",
          backUrl: "",
          headerSteps: [],
          headerStepIndex: 0,
        }}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
      />,
    );

    // Initially, products should be visible
    expect(screen.getAllByText(/Product 1/i)).toHaveLength(2);
    expect(screen.getAllByText(/Product 2/i)).toHaveLength(2);

    // Change methodology to "Not Applicable"
    const methodologyField = screen.getByTestId("root_allocation_methodology");
    const methodologyInput = methodologyField.querySelector(
      'input[role="combobox"]',
    ) as HTMLElement;

    // Open the dropdown
    fireEvent.mouseDown(methodologyInput);

    // Wait for and click "Not Applicable" option
    await waitFor(() => {
      const notApplicableOption = screen.getByRole("option", {
        name: /Not Applicable/i,
      });
      expect(notApplicableOption).toBeVisible();
    });
    const notApplicableOption = screen.getByRole("option", {
      name: /Not Applicable/i,
    });
    await user.click(notApplicableOption);

    // Wait for products to be cleared - they should not be in the document anymore
    await waitFor(() => {
      expect(screen.queryByText(/Product 1/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Product 2/i)).not.toBeInTheDocument();
    });

    // Change methodology back to "Other"
    const methodologyFieldAfter = screen.getByTestId(
      "root_allocation_methodology",
    );
    const methodologyInputAfter = methodologyFieldAfter.querySelector(
      'input[role="combobox"]',
    ) as HTMLElement;

    // Open the dropdown again
    fireEvent.mouseDown(methodologyInputAfter);

    // Wait for and click "Other" option
    await waitFor(() => {
      const otherOption = screen.getByRole("option", { name: /Other/i });
      expect(otherOption).toBeVisible();
    });
    const otherOption = screen.getByRole("option", { name: /Other/i });
    await user.click(otherOption);

    // Products should be restored
    await waitFor(() => {
      expect(screen.getAllByText(/Product 1/i)).toHaveLength(2);
      expect(screen.getAllByText(/Product 2/i)).toHaveLength(2);
    });
  });
});
