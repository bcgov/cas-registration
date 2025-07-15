import { useRouter } from "@bciers/testConfig/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { FinalReviewForm } from "@reporting/src/app/components/finalReview/FinalReviewForm";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

vi.mock("@reporting/src/app/utils/getFinalReviewData", () => ({
  getFinalReviewData: vi.fn(),
}));

describe("The FinalReviewForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Loading component while data is being fetched", async () => {
    (getFinalReviewData as vi.Mock).mockResolvedValue(null);

    render(
      <FinalReviewForm
        navigationInformation={{
          headerStepIndex: 4,
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        }}
        version_id={1}
      />,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    await waitFor(() => expect(getFinalReviewData).toHaveBeenCalledWith(1));
  });
  it("renders the facility review section when data is provided", async () => {
    const mockData = {
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
    };

    (getFinalReviewData as vi.Mock).mockResolvedValue(mockData);

    render(
      <FinalReviewForm
        navigationInformation={{
          headerStepIndex: 4,
          headerSteps: [],
          taskList: [],
          backUrl: "back",
          continueUrl: "continue",
        }}
        version_id={1}
      />,
    );

    await waitFor(() =>
      expect(screen.getByTestId("facility-review")).toBeInTheDocument(),
    );
  });
});
