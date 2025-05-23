import { render, screen } from "@testing-library/react";
import RequestIssuanceOfEarnedCreditsPage from "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsPage";

vi.mock("@/compliance/src/app/utils/getRequestIssuanceData", () => ({
  getRequestIssuanceData: vi.fn().mockResolvedValue({
    bccrTradingName: "Test Trading Name",
    validBccrHoldingAccountId: "123456789012345",
    reportingYear: 2023,
    operation_name: "Test Operation",
  }),
}));

vi.mock(
  "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema",
  () => ({
    ActivePage: {
      ReviewComplianceSummary: 0,
      RequestIssuanceOfEarnedCredits: 1,
      TrackStatusOfIssuance: 2,
    },
    generateRequestIssuanceTaskList: vi.fn().mockReturnValue([
      {
        type: "Section",
        title: "2024 Compliance Summary",
        isExpanded: true,
        elements: [
          {
            type: "Page",
            title: "Review 2024 Compliance Summary",
            link: "/compliance-summaries/123/request-issuance/review-compliance-summary",
            isActive: false,
          },
          {
            type: "Page",
            title: "Request Issuance of Earned Credits",
            link: "/compliance-summaries/123/request-issuance/request-issuance-of-earned-credits",
            isActive: true,
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
  "@/compliance/src/app/components/compliance-summary/request-issuance/request-issuance-of-earned-credits/RequestIssuanceOfEarnedCreditsComponent",
  () => ({
    default: (props: any) => (
      <div data-testid="request-issuance-component">
        <div data-testid="data-operation-name">{props.data.operation_name}</div>
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

describe("RequestIssuanceOfEarnedCreditsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with the correct props", async () => {
    const complianceSummaryId = "123";

    const component = await RequestIssuanceOfEarnedCreditsPage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { getRequestIssuanceData } = await import(
      "@/compliance/src/app/utils/getRequestIssuanceData"
    );
    const { generateRequestIssuanceTaskList } = await import(
      "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList"
    );

    expect(getRequestIssuanceData).toHaveBeenCalled();

    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      123,
      2024,
      mockActivePageEnum.RequestIssuanceOfEarnedCredits,
    );

    expect(
      screen.getByTestId("request-issuance-component"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("data-operation-name")).toHaveTextContent(
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

    const component = await RequestIssuanceOfEarnedCreditsPage({
      compliance_summary_id: complianceSummaryId,
    });
    render(component);

    const { generateRequestIssuanceTaskList } = await import(
      "@/compliance/src/app/components/taskLists/2_requestIssuanceTaskList"
    );

    expect(generateRequestIssuanceTaskList).toHaveBeenCalledWith(
      456,
      2024,
      mockActivePageEnum.RequestIssuanceOfEarnedCredits,
    );

    expect(screen.getByTestId("compliance-summary-id")).toHaveTextContent(
      "456",
    );
  });
});
