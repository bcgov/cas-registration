import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import TrackStatusOfIssuanceComponent from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceComponent";
import {
  IssuanceStatus,
  RequestIssuanceTrackStatusData,
} from "../../../../../app/utils/getRequestIssuanceTrackStatusData";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

vi.mock("@bciers/components/layout/CompliancePageLayout", () => ({
  default: ({ taskListElements, title, children }: any) => (
    <div>
      <h1>{title}</h1>
      <div aria-label="task list elements">
        {JSON.stringify(taskListElements)}
      </div>
      <div role="main">{children}</div>
    </div>
  ),
}));

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/TrackStatusOfIssuanceContent",
  () => ({
    TrackStatusOfIssuanceContent: ({
      data,
      backUrl,
      complianceSummaryId,
    }: any) => (
      <section aria-label="track status content">
        <h2>{data.operation_name}</h2>
        <a href={backUrl} aria-label="back link">
          {backUrl}
        </a>
        <p aria-label="compliance summary id">{complianceSummaryId}</p>
      </section>
    ),
  }),
);

const mockData: RequestIssuanceTrackStatusData = {
  operation_name: "Test Operation",
  earnedCredits: 100,
  issuanceStatus: IssuanceStatus.APPROVED,
  bccrTradingName: "Test Trading Name",
  directorsComments: "Director's test comments",
};

const mockTaskListElements: TaskListElement[] = [
  {
    type: "Page",
    title: "Test Task",
    link: "/test-link",
    isActive: true,
  },
];

describe("TrackStatusOfIssuanceComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct page title from operation name", () => {
    const complianceSummaryId = "123";

    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    const pageTitle = screen.getByRole("heading", { level: 1 });
    expect(pageTitle).toBeVisible();
    expect(pageTitle).toHaveTextContent(mockData.operation_name);
  });

  it("passes the task list elements to the page layout", () => {
    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId="123"
        taskListElements={mockTaskListElements}
      />,
    );

    const taskListElementsContainer =
      screen.getByLabelText("task list elements");
    expect(taskListElementsContainer).toBeVisible();
    expect(taskListElementsContainer).toHaveTextContent(
      JSON.stringify(mockTaskListElements),
    );
  });

  it("constructs the correct back URL based on complianceSummaryId", () => {
    const complianceSummaryId = "456";

    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    const expectedBackUrl = `/compliance-summaries/${complianceSummaryId}/request-issuance-of-earned-credits`;
    const backUrlElement = screen.getByLabelText("back link");
    expect(backUrlElement).toBeVisible();
    expect(backUrlElement).toHaveTextContent(expectedBackUrl);
  });

  it("passes all required props to TrackStatusOfIssuanceContent", () => {
    const complianceSummaryId = "123";

    render(
      <TrackStatusOfIssuanceComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    expect(screen.getByLabelText("track status content")).toBeVisible();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      mockData.operation_name,
    );
    expect(screen.getByLabelText("back link")).toBeVisible();
    expect(screen.getByLabelText("compliance summary id")).toHaveTextContent(
      complianceSummaryId,
    );
  });
});
