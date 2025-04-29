import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import RequestIssuanceOfEarnedCreditsComponent from "../../../../../app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent";
import { RequestIssuanceData } from "../../../../../app/utils/getRequestIssuanceData";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

vi.mock("@bciers/components/layout/CompliancePageLayout", () => ({
  default: ({ children, title, taskListElements }: any) => (
    <div data-testid="compliance-page-layout">
      <h1 data-testid="page-title">{title}</h1>
      <div data-testid="task-list-elements">
        {JSON.stringify(taskListElements)}
      </div>
      <div data-testid="page-content">{children}</div>
    </div>
  ),
}));

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsContent",
  () => ({
    RequestIssuanceOfEarnedCreditsContent: ({
      data,
      backUrl,
      continueUrl,
      complianceSummaryId,
    }: any) => (
      <div data-testid="request-issuance-content">
        <div data-testid="operation-name">{data.operation_name}</div>
        <div data-testid="back-url">{backUrl}</div>
        <div data-testid="continue-url">{continueUrl}</div>
        <div data-testid="compliance-summary-id">{complianceSummaryId}</div>
      </div>
    ),
  }),
);

const mockData: RequestIssuanceData = {
  bccrTradingName: "Test Trading Name",
  validBccrHoldingAccountId: "123456789012345",
  reportingYear: 2023,
  operation_name: "Test Operation",
};

const mockTaskListElements: TaskListElement[] = [
  {
    type: "Page",
    title: "Test Task",
    link: "/test-link",
    isActive: true,
  },
];

describe("RequestIssuanceOfEarnedCreditsComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with the correct page title from operation name", () => {
    const complianceSummaryId = 123;

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    const pageTitle = screen.getByTestId("page-title");
    expect(pageTitle).toBeInTheDocument();
    expect(pageTitle).toHaveTextContent(mockData.operation_name);
  });

  it("passes the task list elements to the page layout", () => {
    render(
      <RequestIssuanceOfEarnedCreditsComponent
        data={mockData}
        complianceSummaryId={123}
        taskListElements={mockTaskListElements}
      />,
    );

    const taskListElementsContainer = screen.getByTestId("task-list-elements");
    expect(taskListElementsContainer).toBeInTheDocument();
    expect(taskListElementsContainer).toHaveTextContent(
      JSON.stringify(mockTaskListElements),
    );
  });

  it("constructs the correct back URL based on complianceSummaryId", () => {
    const complianceSummaryId = 456;

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    const expectedBackUrl = `/compliance-summaries/456/request-issuance/review-compliance-summary`;
    const backUrlElement = screen.getByTestId("back-url");
    expect(backUrlElement).toBeInTheDocument();
    expect(backUrlElement).toHaveTextContent(expectedBackUrl);
  });

  it("constructs the correct continue URL based on complianceSummaryId", () => {
    const complianceSummaryId = 456;

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    const expectedContinueUrl = `/compliance-summaries/456/request-issuance/track-status-of-issuance`;
    const continueUrlElement = screen.getByTestId("continue-url");
    expect(continueUrlElement).toBeInTheDocument();
    expect(continueUrlElement).toHaveTextContent(expectedContinueUrl);
  });

  it("passes all required props to RequestIssuanceOfEarnedCreditsContent", () => {
    const complianceSummaryId = 123;

    render(
      <RequestIssuanceOfEarnedCreditsComponent
        data={mockData}
        complianceSummaryId={complianceSummaryId}
        taskListElements={mockTaskListElements}
      />,
    );

    expect(screen.getByTestId("request-issuance-content")).toBeInTheDocument();
    expect(screen.getByTestId("operation-name")).toHaveTextContent(
      mockData.operation_name,
    );
    expect(screen.getByTestId("compliance-summary-id")).toHaveTextContent(
      "123",
    );
    expect(screen.getByTestId("back-url")).toBeInTheDocument();
    expect(screen.getByTestId("continue-url")).toBeInTheDocument();
  });
});
