import { render, screen } from "@testing-library/react";
import SubmittedPage from "@reporting/src/app/components/submitted/SubmittedPage";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import { ReportingFlow, ReportingOrigin } from "@reporting/src/app/components/taskList/types";

vi.mock("@reporting/src/app/components/taskList/reportingFlows", () => ({
  getFlowWithNewCases: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getFinalReviewData", () => ({
  getFinalReviewData: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getAttachments", () => ({
  default: vi.fn(),
}));
vi.mock("@reporting/src/app/components/submitted/ReportForm", () => ({
  default: ({ origin, data, attachments }: any) => (
    <div data-testid="report-form">
      <span data-testid="origin">{origin}</span>
      <span data-testid="operation-name">
        {data?.report_operation?.operation_name}
      </span>
      <span data-testid="attachments-count">{attachments?.length}</span>
    </div>
  ),
}));

const mockData = { report_operation: { operation_name: "Test Op" } };
const mockAttachments = [
  { id: 1, attachment_type: "verification_statement", attachment_name: "v.pdf" },
];

describe("SubmittedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getFlowWithNewCases as ReturnType<typeof vi.fn>).mockResolvedValue(
      ReportingFlow.SFO,
    );
    (getFinalReviewData as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);
    (getAttachments as ReturnType<typeof vi.fn>).mockResolvedValue({
      attachments: mockAttachments,
    });
  });

  it("calls the correct APIs with the version_id", async () => {
    render(await SubmittedPage({ version_id: 7 }));

    expect(getFlowWithNewCases).toHaveBeenCalledWith(7);
    expect(getFinalReviewData).toHaveBeenCalledWith(7);
    expect(getAttachments).toHaveBeenCalledWith(7);
  });

  it("renders ReportForm with submitted origin, data, and attachments", async () => {
    render(await SubmittedPage({ version_id: 7 }));

    expect(screen.getByTestId("report-form")).toBeVisible();
    expect(screen.getByTestId("origin").textContent).toBe(
      ReportingOrigin.Submitted,
    );
    expect(screen.getByTestId("operation-name").textContent).toBe("Test Op");
    expect(screen.getByTestId("attachments-count").textContent).toBe("1");
  });

  it("passes an empty attachments array when the API returns none", async () => {
    (getAttachments as ReturnType<typeof vi.fn>).mockResolvedValue({
      attachments: null,
    });

    render(await SubmittedPage({ version_id: 7 }));

    expect(screen.getByTestId("attachments-count").textContent).toBe("0");
  });
});
