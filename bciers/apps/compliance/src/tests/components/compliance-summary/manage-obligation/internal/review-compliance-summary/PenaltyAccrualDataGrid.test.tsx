import { render, screen, within } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import { PenaltyAccrualDataGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyAccrualDataGrid";
import { PenaltyAccrual } from "@/compliance/src/app/types";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const buildAccrual = (
  overrides: Partial<PenaltyAccrual> = {},
): PenaltyAccrual => ({
  date: "2026-01-01",
  interest_rate: "0.38",
  daily_penalty: "10.00",
  daily_compounded: "1.00",
  accumulated_penalty: "10.00",
  accumulated_compounded: "1.00",
  ...overrides,
});

describe("PenaltyAccrualDataGrid", () => {
  it("renders the default label and the expected column headers", () => {
    render(
      <PenaltyAccrualDataGrid
        formData={{ query_id: "Automatic Overdue-2026-01-15", rows: [] }}
      />,
    );

    expect(screen.getByText("Accrual data")).toBeVisible();
    for (const header of [
      "Date",
      "Daily Penalty",
      "Daily compounded",
      "Accumulated penalty",
      "Accumulated compounded",
      "Interest rate %",
    ]) {
      expect(screen.getByRole("columnheader", { name: header })).toBeVisible();
    }
  });

  it("renders a row per accrual", () => {
    render(
      <PenaltyAccrualDataGrid
        formData={{
          query_id: "Automatic Overdue-2026-01-15",
          rows: [
            buildAccrual(),
            buildAccrual({ date: "2026-01-02", accumulated_penalty: "30.00" }),
          ],
        }}
      />,
    );

    const grid = screen.getByRole("grid");
    expect(within(grid).getByText("2026-01-01")).toBeVisible();
    expect(within(grid).getByText("2026-01-02")).toBeVisible();
    expect(within(grid).getByText("30.00")).toBeVisible();
  });

  it("hides the label when the ui schema turns it off", () => {
    render(
      <PenaltyAccrualDataGrid
        formData={{ query_id: "Automatic Overdue-2026-01-15", rows: [] }}
        uiSchema={{ "ui:options": { label: false } }}
      />,
    );

    expect(screen.queryByText("Accrual data")).not.toBeInTheDocument();
  });

  it("swaps the rows over when a new result set arrives", () => {
    const { rerender } = render(
      <PenaltyAccrualDataGrid
        formData={{
          query_id: "Automatic Overdue-2026-01-15",
          rows: [buildAccrual()],
        }}
      />,
    );

    expect(screen.getByText("2026-01-01")).toBeVisible();

    rerender(
      <PenaltyAccrualDataGrid
        formData={{
          query_id: "Late Submission-2026-01-15",
          rows: [buildAccrual({ date: "2026-02-02" })],
        }}
      />,
    );

    expect(screen.getByText("2026-02-02")).toBeVisible();
    expect(screen.queryByText("2026-01-01")).not.toBeInTheDocument();
  });

  it("swaps the rows over when only the accrual end date changes", () => {
    const { rerender } = render(
      <PenaltyAccrualDataGrid
        formData={{
          query_id: "Automatic Overdue-2026-01-15",
          rows: [buildAccrual()],
        }}
      />,
    );

    rerender(
      <PenaltyAccrualDataGrid
        formData={{
          query_id: "Automatic Overdue-2027-01-10",
          rows: [buildAccrual({ date: "2026-03-03" })],
        }}
      />,
    );

    expect(screen.getByText("2026-03-03")).toBeVisible();
    expect(screen.queryByText("2026-01-01")).not.toBeInTheDocument();
  });
});
