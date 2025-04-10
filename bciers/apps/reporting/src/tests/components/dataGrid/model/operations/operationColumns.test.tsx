import { describe, vi } from "vitest";
import operationColumns from "@reporting/src/app/components/datagrid/models/operations/operationColumns";
import { GridColDef } from "@mui/x-data-grid";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@bciers/testConfig/mocks";
import { ReportOperationStatus } from "@bciers/utils/src/enums";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";

vi.mock("@bciers/utils/src/formatTimestamp", () => ({
  default: vi.fn((value) => `Formatted(${value})`),
}));

const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});

describe("operationColumns function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an array of column definitions", () => {
    const columns: GridColDef[] = operationColumns();

    expect(columns).toHaveLength(7);

    expect(columns[0].field).toBe("bcghg_id");
    expect(columns[0].headerName).toBe("BC GHG ID");
    expect(columns[0].width).toBe(160);

    expect(columns[1].field).toBe("operation_name");
    expect(columns[1].headerName).toBe("Operation");
    expect(columns[1].width).toBe(300);

    expect(columns[2].field).toBe("report_updated_at");
    expect(columns[2].headerName).toBe("Date of submission");
    expect(columns[2].width).toBe(200);

    expect(columns[3].field).toBe("report_submitted_by");
    expect(columns[3].headerName).toBe("Submitted by");
    expect(columns[3].width).toBe(200);

    expect(columns[4].field).toBe("report_status");
    expect(columns[4].headerName).toBe("Status");
    expect(columns[4].width).toBe(200);

    expect(columns[5].field).toBe("report_id");
    expect(columns[5].headerName).toBe("Actions");
    expect(columns[5].width).toBe(200);

    expect(columns[6].field).toBe("more");
    expect(columns[6].headerName).toBe("More Actions");
    expect(columns[6].width).toBe(120);
  });

  it("renders an empty string in UpdatedAtCell if report_status is DRAFT", () => {
    const columns = operationColumns();
    const params = {
      row: { report_status: ReportOperationStatus.DRAFT },
      value: "2024-03-01T12:00:00Z",
    };

    expect(columns[2].renderCell(params)).toBe("");
  });

  it("renders a formatted timestamp in UpdatedAtCell if report_status is not DRAFT", () => {
    const columns = operationColumns();
    const params = {
      row: { report_status: "Submitted" },
      value: "2024-03-01T12:00:00Z",
    };

    expect(columns[2].renderCell(params)).toBe(
      formatTimestamp("2024-03-01T12:00:00Z"),
    );
  });

  it("renders an empty string in SubmittedByCell if report_status is DRAFT", () => {
    const columns = operationColumns();
    const params = {
      row: {
        report_status: ReportOperationStatus.DRAFT,
        submitted_by: "User A",
      },
    };

    expect(columns[3].renderCell(params)).toBe("");
  });

  it("renders the submitted_by value in SubmittedByCell if report_status is not DRAFT", () => {
    const columns = operationColumns();
    const params = {
      row: { report_status: "Submitted", submitted_by: "User A" },
    };

    expect(columns[3].renderCell(params)).toBe("User A");
  });

  it("has a 'start' button in the 'Actions' column when report_version_id is null", () => {
    const columns: GridColDef[] = operationColumns();

    const row = {
      id: "2",
      bcghg_id: "12111130002",
      operation_name: "Operation without report",
      report_id: null,
      report_version_id: null,
      report_status: null,
    };

    const params = {
      row,
      value: row.report_version_id,
    };

    function WrapperComponent() {
      const cell = columns[5].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("has a 'continue' button in the 'Actions' column when report_id exists", () => {
    const columns: GridColDef[] = operationColumns();

    const row = {
      id: "1",
      bcghg_id: "12111130002",
      operation_name: "Operation without report",
      report_id: 1,
      report_version_id: 1,
      report_status: "Draft",
    };

    const params = {
      row,
      value: row.report_id,
    };

    function WrapperComponent() {
      const cell = columns[5].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("navigates to the matching report page when clicking the 'Continue' button", async () => {
    const user = userEvent.setup();

    const columns = operationColumns();

    const row = {
      id: "1",
      bcghg_id: "12111130002",
      operation_name: "Operation with report",
      report_id: 15,
      report_version_id: 15,
      report_status: "Draft",
    };

    const params = {
      row,
      value: row.report_id,
    };

    function WrapperComponent() {
      const cell = columns[5].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    await user.click(screen.getByText("Continue"));

    expect(mockPush).toHaveBeenCalledWith(
      `reports/15/review-operation-information`,
    );
  });
});
