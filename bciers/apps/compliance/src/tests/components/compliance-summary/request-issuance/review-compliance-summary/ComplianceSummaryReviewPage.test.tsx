import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import ComplianceSummaryReviewPage from "../../../../../app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewPage";

vi.mock(
  "../../../../../app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn().mockResolvedValue({
      operation_name: "Test Operation",
      operation_id: 123,
      reporting_year: 2024,
      excess_emissions: "-15.0",
      emission_limit: "100.0",
      emissions_attributable_for_compliance: "85.0",
      earned_credits: 15,
    }),
  }),
);

vi.mock(
  "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema",
  () => ({
    ActivePage: {
      ReviewComplianceSummary: 0,
      RequestIssuanceOfEarnedCredits: 1,
      TrackStatusOfIssuance: 2,
    },
    getRequestIssuanceTaskList: vi.fn().mockReturnValue([
      {
        type: "Section",
        title: "2024 Compliance Summary",
        isExpanded: true,
        elements: [
          {
            type: "Page",
            title: "Review 2024 Compliance Summary",
            link: "/compliance-summaries/123/request-issuance/review-compliance-summary",
            isActive: true,
          },
          {
            type: "Page",
            title: "Request Issuance of Earned Credits",
            link: "/compliance-summaries/123/request-issuance/request-issuance-of-earned-credits",
            isActive: false,
          },
          {
            type: "Page",
            title: "Track Status of Issuance",
            link: "/compliance-summaries/123/request-issuance/track-status-of-issuance",
            isActive: false,
          },
        ],
      },
    ]),
  }),
);

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/review-compliance-summary/RequestIssuanceReviewComponent",
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
  RequestIssuanceOfEarnedCredits: 1,
  TrackStatusOfIssuance: 2,
} as const;

describe("ComplianceSummaryReviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with the correct props", async () => {
    const complianceSummaryId = "123";

    const component = await ComplianceSummaryReviewPage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { getRequestIssuanceComplianceSummaryData } = await import(
      "../../../../../app/utils/getRequestIssuanceComplianceSummaryData"
    );
    const { getRequestIssuanceTaskList } = await import(
      "../../../../../app/components/taskLists/2_requestIssuanceSchema"
    );

    expect(getRequestIssuanceComplianceSummaryData).toHaveBeenCalledWith(
      complianceSummaryId,
    );

    expect(getRequestIssuanceTaskList).toHaveBeenCalledWith(
      123,
      2024,
      mockActivePageEnum.ReviewComplianceSummary,
    );

    const reviewComponent = screen.getByTestId("review-component");
    expect(reviewComponent).toBeInTheDocument();
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

    const { getRequestIssuanceTaskList } = await import(
      "../../../../../app/components/taskLists/2_requestIssuanceSchema"
    );

    expect(getRequestIssuanceTaskList).toHaveBeenCalledWith(
      456,
      2024,
      mockActivePageEnum.ReviewComplianceSummary,
    );

    expect(screen.getByTestId("compliance-summary-id")).toHaveTextContent(
      "456",
    );
  });
});
