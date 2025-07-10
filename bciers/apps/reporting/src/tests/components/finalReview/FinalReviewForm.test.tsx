import { useRouter } from "@bciers/testConfig/mocks";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { FinalReviewForm } from "@reporting/src/app/components/finalReview/FinalReviewForm";

// ✨ Mocks
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

describe("The FinalReviewForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("displays a message when no data is provided", () => {
    render(
      <FinalReviewForm
        navigationInformation={{
          headerStepIndex: 4,
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        }}
        data={null}
      />,
    );

    expect(
      screen.getByText(
        "The system is unable to display a large amount of facility reports. This issue will be fixed in a future version of the system. To review your facility reports, please return to report information.",
      ),
    ).toBeInTheDocument();
  });

  it("renders the facility review section when data is provided", () => {
    render(
      <FinalReviewForm
        navigationInformation={{
          headerStepIndex: 4,
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        }}
        data={{
          report_operation: {
            activities: "",
            regulated_products: "",
            representatives: "",
            operator_legal_name: "",
            operator_trade_name: "",
            operation_name: "",
            operation_type: "",
            operation_bcghgid: null,
            bc_obps_regulated_operation_id: "",
            registration_purpose: "",
          },
          report_person_responsible: {
            first_name: "",
            last_name: "",
            position_title: "",
            business_role: "",
            email: "",
            phone_number: "",
            street_address: "",
            municipality: "",
            province: "",
            postal_code: "",
          },
          facility_reports: [],
          report_additional_data: {
            capture_emissions: false,
            emissions_on_site_use: "",
            emissions_on_site_sequestration: "",
            emissions_off_site_transfer: "",
            electricity_generated: 0,
          },
          report_compliance_summary: {
            emissions_attributable_for_reporting: "",
            reporting_only_emissions: "",
            emissions_attributable_for_compliance: "",
            emissions_limit: "",
            excess_emissions: "",
            credited_emissions: "",
            regulatory_values: {
              reduction_factor: "",
              tightening_rate: "",
              initial_compliance_period: 0,
              compliance_period: 0,
            },
            products: [],
          },
        }}
      />,
    );

    expect(screen.getByTestId("facility-review")).toBeInTheDocument();
  });

  it("routes back when the back button is clicked", () => {
    const expectedRoute = "back";

    render(
      <FinalReviewForm
        navigationInformation={{
          headerStepIndex: 4,
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        }}
        data={null}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(expectedRoute);
  });

  it("routes forward when the continue button is clicked", () => {
    const expectedRoute = "continue";

    render(
      <FinalReviewForm
        navigationInformation={{
          headerStepIndex: 4,
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        }}
        data={null}
      />,
    );

    const continueButton = screen.getByRole("button", { name: "Continue" });
    fireEvent.click(continueButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(expectedRoute);
  });
});
