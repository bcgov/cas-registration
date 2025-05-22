import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import TrackStatusOfIssuancePage from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuancePage";

vi.mock("../../../../../app/utils/getRequestIssuanceTrackStatusData", () => ({
  getRequestIssuanceTrackStatusData: vi.fn().mockResolvedValue({
    operation_name: "Test Operation",
    earnedCredits: 100,
    issuanceStatus: "approved",
    bccrTradingName: "Test Trading Name",
    directorsComments: "Director's test comments",
  }),
  IssuanceStatus: {
    APPROVED: "approved",
    AWAITING: "awaiting",
  },
}));

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
            link: "/compliance-summaries/123/review-compliance-summary",
            isActive: false,
          },
          {
            type: "Page",
            title: "Request Issuance of Earned Credits",
            link: "/compliance-summaries/123/request-issuance-of-earned-credits",
            isActive: false,
          },
          {
            type: "Page",
            title: "Track Status of Issuance",
            link: "/compliance-summaries/123/track-status-of-issuance",
            isActive: true,
          },
        ],
      },
    ]),
  }),
);

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceComponent",
  () => ({
    default: (props: any) => (
      <section aria-label="track status of issuance component">
        <h1>{props.data.operation_name}</h1>
        <div aria-label="issuance status">{props.data.issuanceStatus}</div>
        <div aria-label="compliance summary id">
          {props.complianceSummaryId}
        </div>
        <nav aria-label="task list navigation">
          {props.taskListElements ? "task-list-present" : "no-task-list"}
        </nav>
      </section>
    ),
  }),
);

const mockActivePageEnum = {
  ReviewComplianceSummary: 0,
  RequestIssuanceOfEarnedCredits: 1,
  TrackStatusOfIssuance: 2,
} as const;

describe("TrackStatusOfIssuancePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with the correct props", async () => {
    const complianceSummaryId = "123";

    const component = await TrackStatusOfIssuancePage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { getRequestIssuanceTrackStatusData } = await import(
      "../../../../../app/utils/getRequestIssuanceTrackStatusData"
    );
    const { getRequestIssuanceTaskList } = await import(
      "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema"
    );

    expect(getRequestIssuanceTrackStatusData).toHaveBeenCalledWith(
      complianceSummaryId,
    );

    expect(getRequestIssuanceTaskList).toHaveBeenCalledWith(
      123,
      2024,
      mockActivePageEnum.TrackStatusOfIssuance,
    );

    expect(
      screen.getByLabelText("track status of issuance component"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Test Operation",
    );
    expect(screen.getByLabelText("issuance status")).toHaveTextContent(
      "approved",
    );
    expect(screen.getByLabelText("compliance summary id")).toHaveTextContent(
      "123",
    );
    expect(screen.getByLabelText("task list navigation")).toHaveTextContent(
      "task-list-present",
    );
  });

  it("handles string compliance_summary_id by converting it to a number", async () => {
    const complianceSummaryId = "456";

    const component = await TrackStatusOfIssuancePage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { getRequestIssuanceTaskList } = await import(
      "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema"
    );

    expect(getRequestIssuanceTaskList).toHaveBeenCalledWith(
      456,
      2024,
      mockActivePageEnum.TrackStatusOfIssuance,
    );

    expect(screen.getByLabelText("compliance summary id")).toHaveTextContent(
      "456",
    );
  });

  it("renders TrackStatusOfIssuanceComponent with correct props", async () => {
    const complianceSummaryId = "123";
    const component = await TrackStatusOfIssuancePage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const renderedComponent = screen.getByLabelText(
      "track status of issuance component",
    );
    expect(renderedComponent).toBeVisible();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Test Operation",
    );
    expect(screen.getByLabelText("issuance status")).toHaveTextContent(
      "approved",
    );
    expect(screen.getByLabelText("compliance summary id")).toHaveTextContent(
      "123",
    );
    expect(screen.getByLabelText("task list navigation")).toHaveTextContent(
      "task-list-present",
    );
  });
});
