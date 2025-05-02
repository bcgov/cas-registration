import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import ComplianceSummaryReviewPage from "../../../../../app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewPage";

vi.mock("../../../../../app/utils/getComplianceSummary", () => ({
  getComplianceSummary: vi.fn().mockResolvedValue({
    operation_name: "Test Operation",
    operation_id: 123,
    reporting_year: 2024,
    excess_emissions: "15.0",
    emission_limit: "100.0",
    emissions_attributable_for_compliance: "115.0",
    obligation_id: "OB-2024-123",
    compliance_charge_rate: 80,
    equivalent_value: 1200,
  }),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationSchema",
  () => ({
    ActivePage: {
      ReviewComplianceSummary: 0,
      DownloadPaymentInstructions: 2,
      PayObligationTrackPayments: 3,
    },
    getComplianceSummaryTaskList: vi.fn().mockReturnValue([
      {
        type: "Section",
        title: "2024 Compliance Summary",
        isExpanded: true,
        elements: [
          {
            type: "Page",
            title: "Review 2024 Compliance Summary",
            link: "/compliance-summaries/123/manage-obligation/review-compliance-summary",
            isActive: true,
          },
          {
            type: "Page",
            title: "Download Payment Instructions",
            link: "/compliance-summaries/123/manage-obligation/download-payment-instructions",
            isActive: false,
          },
          {
            type: "Page",
            title: "Pay Obligation and Track Payment(s)",
            link: "/compliance-summaries/123/manage-obligation/pay-obligation-track-payments",
            isActive: false,
          },
        ],
      },
    ]),
  }),
);

vi.mock(
  "../../../../../app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent",
  () => ({
    default: (props: any) => (
      <div data-testid="review-component">
        <div data-testid="form-data-operation-name">
          {props.formData.operation_name}
        </div>
        <div data-testid="compliance-summary-id">
          {props.complianceSummaryId}
        </div>
        <div data-testid="task-list-elements">
          {props.taskListElements ? "task-list-present" : "no-task-list"}
        </div>
      </div>
    ),
  }),
);

const mockActivePageEnum = {
  ReviewComplianceSummary: 0,
  DownloadPaymentInstructions: 1,
  PayObligationTrackPayments: 2,
} as const;

describe("ComplianceSummaryReviewPage (Manage Obligation)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with the correct props", async () => {
    const complianceSummaryId = "123";

    const component = await ComplianceSummaryReviewPage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { getComplianceSummary } = await import(
      "../../../../../app/utils/getComplianceSummary"
    );
    const { getComplianceSummaryTaskList } = await import(
      "@/compliance/src/app/components/taskLists/1_manageObligationSchema"
    );

    expect(getComplianceSummary).toHaveBeenCalledWith(123);

    expect(getComplianceSummaryTaskList).toHaveBeenCalledWith(
      123,
      2024,
      mockActivePageEnum.ReviewComplianceSummary,
    );

    const reviewComponent = screen.getByTestId("review-component");
    expect(reviewComponent).toBeVisible();
    expect(screen.getByTestId("form-data-operation-name")).toHaveTextContent(
      "Test Operation",
    );
    expect(screen.getByTestId("compliance-summary-id")).toHaveTextContent(
      "123",
    );
    expect(screen.getByTestId("task-list-elements")).toHaveTextContent(
      "task-list-present",
    );
  });

  it("handles string compliance_summary_id by converting it to a number", async () => {
    const complianceSummaryId = "456";

    const component = await ComplianceSummaryReviewPage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { getComplianceSummary } = await import(
      "../../../../../app/utils/getComplianceSummary"
    );
    const { getComplianceSummaryTaskList } = await import(
      "@/compliance/src/app/components/taskLists/1_manageObligationSchema"
    );

    expect(getComplianceSummary).toHaveBeenCalledWith(456);

    expect(getComplianceSummaryTaskList).toHaveBeenCalledWith(
      456,
      2024,
      mockActivePageEnum.ReviewComplianceSummary,
    );

    expect(screen.getByTestId("compliance-summary-id")).toHaveTextContent(
      "456",
    );
  });
});
