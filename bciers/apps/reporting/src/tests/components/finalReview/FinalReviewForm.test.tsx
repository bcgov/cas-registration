import { useRouter } from "@bciers/testConfig/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { FinalReviewForm } from "@reporting/src/app/components/finalReview/FinalReviewForm";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import { HeaderStep } from "@reporting/src/app/components/taskList/types";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

vi.mock("@reporting/src/app/utils/getFinalReviewData", () => ({
  getFinalReviewData: vi.fn(),
}));

vi.mock("@bciers/components/form/components/MultiStepHeader", () => ({
  default: () => <div data-testid="multi-step-header">Multi Step Header</div>,
}));

vi.mock("@bciers/components/form/components/ReportingStepButtons", () => ({
  default: () => <div data-testid="reporting-step-buttons">Step Buttons</div>,
}));

vi.mock(
  "@bciers/components/navigation/reportingTaskList/ReportingTaskList",
  () => ({
    default: () => <div data-testid="reporting-task-list">Task List</div>,
  }),
);

describe("The FinalReviewForm component", () => {
  const mockNavigationInformation = {
    headerStepIndex: 4,
    headerSteps: [
      HeaderStep.OperationInformation,
      HeaderStep.ReportInformation,
      HeaderStep.EmissionsData,
      HeaderStep.AdditionalInformation,
      HeaderStep.ComplianceSummary,
      HeaderStep.SignOffSubmit,
    ],
    taskList: [
      {
        type: "Section" as const,
        title: "Operation Information",
        isChecked: true,
        isExpanded: false,
        isActive: false,
      },
      {
        type: "Section" as const,
        title: "Report Information",
        isChecked: true,
        isExpanded: false,
        isActive: false,
      },
    ],
    backUrl: "/back",
    continueUrl: "/continue",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Loading component while data is being fetched", async () => {
    (getFinalReviewData as any).mockImplementation(
      () => new Promise(() => {}), // Never resolves to keep loading state
    );

    render(
      <FinalReviewForm
        navigationInformation={mockNavigationInformation}
        version_id={1}
      />,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(getFinalReviewData).toHaveBeenCalledWith(1);
  });

  it("renders all components when data is provided", async () => {
    const mockData = {
      report_operation: {
        activities: "Test Activities",
        regulated_products: "Test Products",
        representatives: "Test Reps",
        operator_legal_name: "Test Legal Name",
        operator_trade_name: "Test Trade Name",
        operation_name: "Test Operation",
        operation_type: "SFO",
        operation_bcghgid: "123456",
        bc_obps_regulated_operation_id: "REG123",
        registration_purpose: "REPORTING_OPERATION",
      },
      report_person_responsible: {
        first_name: "John",
        last_name: "Doe",
        position_title: "Manager",
        business_role: "Owner",
        email: "john@example.com",
        phone_number: "555-1234",
        street_address: "123 Main St",
        municipality: "Vancouver",
        province: "BC",
        postal_code: "V6B 1A1",
      },
      facility_reports: [
        {
          facility: "facility-1",
          facility_name: "Test Facility",
          activity_data: [],
          emission_summary: {},
          reportnonattributableemissions_records: [],
        },
      ],
      report_additional_data: {
        capture_emissions: false,
        emissions_on_site_use: "100",
        emissions_on_site_sequestration: "50",
        emissions_off_site_transfer: "25",
        electricity_generated: 1000,
      },
      report_compliance_summary: {
        emissions_attributable_for_reporting: "1000",
        reporting_only_emissions: "500",
        emissions_attributable_for_compliance: "800",
        emissions_limit: "1200",
        excess_emissions: "0",
        credited_emissions: "200",
        regulatory_values: {
          reduction_factor: "0.05",
          tightening_rate: "0.02",
          initial_compliance_period: 2021,
          compliance_period: 2024,
        },
        products: [],
      },
    };

    (getFinalReviewData as any).mockResolvedValue(mockData);

    render(
      <FinalReviewForm
        navigationInformation={mockNavigationInformation}
        version_id={1}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("facility-review")).toBeInTheDocument();
      expect(screen.getByTestId("multi-step-header")).toBeInTheDocument();
      expect(screen.getByTestId("reporting-task-list")).toBeInTheDocument();
      expect(screen.getByTestId("reporting-step-buttons")).toBeInTheDocument();
    });
  });
});
