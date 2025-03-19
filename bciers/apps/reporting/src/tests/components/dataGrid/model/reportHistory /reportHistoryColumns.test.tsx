import { describe, vi } from "vitest";
import reportHistoryColumns from "@reporting/src/app/components/datagrid/models/reportHistory/reportHistoryColumns";
import { GridColDef } from "@mui/x-data-grid";
import { render, screen } from "@testing-library/react";
import { useRouter } from "@bciers/testConfig/mocks";
import userEvent from "@testing-library/user-event";

vi.mock("@reporting/src/app/utils/formatDate", () => ({
  formatDate: vi.fn((date) => `Formatted(${date})`),
}));

const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});
describe("reportHistoryColumns function", () => {
  it("returns an array of column definitions", () => {
    const columns: GridColDef[] = reportHistoryColumns();

    expect(columns).toHaveLength(4);

    expect(columns[0].field).toBe("version");
    expect(columns[0].headerName).toBe("Report version");
    expect(columns[0].width).toBe(300);
    expect(columns[0].sortable).toBe(false);

    expect(columns[1].field).toBe("updated_at");
    expect(columns[1].headerName).toBe("Date of submission");
    expect(columns[1].width).toBe(400);
    expect(columns[1].sortable).toBe(false);

    expect(columns[2].field).toBe("submitted_by");
    expect(columns[2].headerName).toBe("Submitted by");
    expect(columns[2].width).toBe(400);
    expect(columns[2].sortable).toBe(false);

    expect(columns[3].field).toBe("status");
    expect(columns[3].headerName).toBe("Actions");
    expect(columns[3].width).toBe(200);
    expect(columns[3].sortable).toBe(false);
    expect(columns[3].flex).toBe(1);
  });

  it("renders an empty string if updated_at is null", () => {
    const columns = reportHistoryColumns();
    const params = { value: null };
    expect(columns[1].renderCell(params)).toBe("");
  });

  it("renders the Actions column correctly", () => {
    const columns = reportHistoryColumns();

    const row = {
      id: 1,
      version: "Current version",
      updated_at: "2024-03-01T12:00:00Z",
      submitted_by: "User A",
      status: "Submitted",
    };

    const params = {
      row,
      value: row.status,
      id: row.id,
    };

    function WrapperComponent() {
      const cell = columns[3].renderCell;
      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    expect(
      screen.getByRole("button", { name: "View Details" }),
    ).toBeInTheDocument();
  });
  it('navigates to the matching report page when clicking the "Continue" button', async () => {
    const user = userEvent.setup();

    const columns = reportHistoryColumns();

    const row = {
      id: 1,
      version: "Current version",
      updated_at: "2024-03-01T12:00:00Z",
      submitted_by: "User A",
      status: "Draft",
    };

    const params = {
      row,
      value: row.status,
      id: row.id,
    };

    function WrapperComponent() {
      const cell = columns[3].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    await user.click(screen.getByText("Continue"));

    expect(mockPush).toHaveBeenCalledWith(
      `/reports/1/review-operation-information`,
    );
  });

  it('navigates to the final review when clicking the "View Details" button', async () => {
    const user = userEvent.setup();

    const columns = reportHistoryColumns();

    const row = {
      id: 1,
      version: "Current version",
      updated_at: "2024-03-01T12:00:00Z",
      submitted_by: "User A",
      status: "Submitted",
    };

    const params = {
      row,
      value: row.status,
      id: row.id,
    };

    function WrapperComponent() {
      const cell = columns[3].renderCell;

      return <div>{cell(params)}</div>;
    }

    render(<WrapperComponent />);
    await user.click(screen.getByText("View Details"));

    expect(mockPush).toHaveBeenCalledWith(`/reports/1/final-review`);
  });
});
