import { describe, vi } from "vitest";
import { GridColDef } from "@mui/x-data-grid";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@bciers/testConfig/mocks";
import formatTimestamp from "@bciers/utils/src/formatTimestamp";
import annualReportsColumns from "@reporting/src/app/components/datagrid/models/annualReports/annualReportsColumns";

vi.mock("@bciers/utils/src/formatTimestamp", () => ({
  default: vi.fn((value) => `Formatted(${value})`),
}));

const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});

describe("annualReportsColumns function", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an array of column definitions", () => {
    const columns: GridColDef[] = annualReportsColumns();

    expect(columns).toHaveLength(5);

    expect(columns[0].field).toBe("operation_name");
    expect(columns[0].headerName).toBe("Operation");
    expect(columns[0].width).toBe(500);

    expect(columns[1].field).toBe("report_version_id");
    expect(columns[1].headerName).toBe("Report Version ID");
    expect(columns[1].width).toBe(180);

    expect(columns[2].field).toBe("report_updated_at");
    expect(columns[2].headerName).toBe("Date of submission");
    expect(columns[2].width).toBe(180);

    expect(columns[3].field).toBe("report");
    expect(columns[3].headerName).toBe("Reports");
    expect(columns[3].width).toBe(240);

    expect(columns[4].field).toBe("history");
    expect(columns[4].headerName).toBe("Report History");
    expect(columns[4].width).toBe(240);
  });

  it("renders a formatted timestamp in UpdatedAtCell", () => {
    const columns = annualReportsColumns();
    const params = {
      row: { report_status: "Submitted" },
      value: "2024-03-01T12:00:00Z",
    };

    expect(columns[2].renderCell(params)).toBe(
      formatTimestamp("2024-03-01T12:00:00Z"),
    );
  });

  it("navigates to the view report page when clicking the View Report button", async () => {
    const columns = annualReportsColumns();
    const row = {
      report_version_id: 123,
    };
    const params = { row, value: row.report_version_id };

    function WrapperComponent() {
      const cell = columns[3].renderCell;

      return <div>{cell(params)}</div>;
    }

    const user = userEvent.setup();
    render(<WrapperComponent />);
    const button = screen.getByText("View Report");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("123");
  });

  it("navigates to the report history page when clicking the View Report History button", async () => {
    const columns = annualReportsColumns();
    const row = {
      report_id: 456,
    };
    const params = { row, value: row.report_id };

    function WrapperComponent() {
      const cell = columns[4].renderCell;

      return <div>{cell(params)}</div>;
    }

    const user = userEvent.setup();
    render(<WrapperComponent />);
    const button = screen.getByText("View Report History");
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith("report-history/456");
  });
});
