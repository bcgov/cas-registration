import { render, screen } from "@testing-library/react";
import AnnualReportPage from "@reporting/src/app/components/annualReport/AnnualReportPage";
import { getFlowWithNewCases } from "@reporting/src/app/components/taskList/reportingFlows";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import getAttachments from "@reporting/src/app/utils/getAttachments";
import {
  ReportingFlow,
  ReportingOrigin,
} from "@reporting/src/app/components/taskList/types";

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
  default: ({ origin, data }: any) => (
    <div data-testid="report-form">
      <span data-testid="origin">{origin}</span>
      <span data-testid="operation-name">
        {data?.report_operation?.operation_name}
      </span>
    </div>
  ),
}));

const mockData = { report_operation: { operation_name: "Test Op" } };

describe("AnnualReportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getFlowWithNewCases as ReturnType<typeof vi.fn>).mockResolvedValue(
      ReportingFlow.SFO,
    );
    (getFinalReviewData as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockData,
    );
  });

  it("calls the correct APIs with the version_id", async () => {
    render(await AnnualReportPage({ version_id: 3 }));

    expect(getFlowWithNewCases).toHaveBeenCalledWith(3);
    expect(getFinalReviewData).toHaveBeenCalledWith(3);
  });

  it("does not fetch attachments", async () => {
    render(await AnnualReportPage({ version_id: 3 }));

    expect(getAttachments).not.toHaveBeenCalled();
  });

  it("renders ReportForm with annual-report origin and data", async () => {
    render(await AnnualReportPage({ version_id: 3 }));

    expect(screen.getByTestId("report-form")).toBeVisible();
    expect(screen.getByTestId("origin").textContent).toBe(
      ReportingOrigin.AnnualReport,
    );
    expect(screen.getByTestId("operation-name").textContent).toBe("Test Op");
  });
});
