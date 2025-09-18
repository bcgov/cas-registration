import { useRouter } from "@bciers/testConfig/mocks";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import ReportForm from "@reporting/src/app/components/submitted/ReportForm";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import { vi } from "vitest";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";

const mockRouterPush = vi.fn();
const mockRouterBack = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
  back: mockRouterBack,
});

vi.mock("@reporting/src/app/utils/getFinalReviewData", () => ({
  getFinalReviewData: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections",
  () => ({
    FinalReviewReportSections: ({ data }: { data: any }) => (
      <div data-testid="report-sections">
        Report Sections: {data?.report_operation?.operation_name}
      </div>
    ),
  }),
);

describe("The SubmittedForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Loading component while data is being fetched", async () => {
    (getFinalReviewData as vi.Mock).mockImplementation(
      () => new Promise(() => {}), // Never resolves to keep loading state
    );

    render(
      <ReportForm
        version_id={1}
        flow={ReportingFlow.SFO}
        origin={"submitted"}
      />,
    );

    expect(screen.getByTestId("loading")).toBeInTheDocument();
    expect(getFinalReviewData).toHaveBeenCalledWith(1);
  });

  it("renders ReportSections and Back button when data is provided", async () => {
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
          report_products: [],
          report_emission_allocation: {
            report_product_emission_allocations: [],
            allocation_methodology: null,
            allocation_other_methodology_description: null,
            facility_total_emissions: null,
            report_product_emission_allocation_totals: [],
          },
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

    (getFinalReviewData as vi.Mock).mockResolvedValue(mockData);

    render(
      <ReportForm
        version_id={1}
        flow={ReportingFlow.SFO}
        origin={"submitted"}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("report-sections")).toBeInTheDocument();
      expect(screen.getByText("Back to All Reports")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Report Sections: Test Operation"),
    ).toBeInTheDocument();
  });

  it("calls router.push('/reporting/reports/current-reports') when Back to All Reports button is clicked", async () => {
    const mockData = {
      report_operation: {
        operation_name: "Test Operation",
        operation_type: "SFO",
        registration_purpose: "REPORTING_OPERATION",
      },
      report_person_responsible: {
        first_name: "John",
        last_name: "Doe",
      },
      facility_reports: [],
      report_additional_data: {
        capture_emissions: false,
      },
      report_compliance_summary: {
        regulatory_values: {},
        products: [],
      },
    };

    (getFinalReviewData as vi.Mock).mockResolvedValue(mockData);

    const user = userEvent.setup();
    render(
      <ReportForm
        version_id={1}
        flow={ReportingFlow.SFO}
        origin={"submitted"}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Back to All Reports")).toBeInTheDocument();
    });

    await user.click(screen.getByText("Back to All Reports"));
    expect(mockRouterPush).toHaveBeenCalledWith(
      "/reporting/reports/current-reports",
    );
  });

  it("fetches data with correct version_id", () => {
    (getFinalReviewData as vi.Mock).mockResolvedValue({});

    render(
      <ReportForm
        version_id={42}
        flow={ReportingFlow.SFO}
        origin={"submitted"}
      />,
    );

    expect(getFinalReviewData).toHaveBeenCalledWith(42);
  });
});
