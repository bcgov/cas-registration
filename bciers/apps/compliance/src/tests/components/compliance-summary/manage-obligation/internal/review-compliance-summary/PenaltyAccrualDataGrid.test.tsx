import { render, screen } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import { PenaltyAccrualDataGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltyAccrualDataGrid";

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("PenaltyAccrualDataGrid", () => {
  it("renders default label and expected DataGrid column headers", () => {
    render(<PenaltyAccrualDataGrid formData={{ tableData: [] }} />);

    expect(screen.getByText("Accrual data")).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Date" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Daily Penalty" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Daily compounded" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Accumulated penalty" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Accumulated compounded" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Interest rate %" }),
    ).toBeVisible();
  });

  it("renders supplied label and row data", () => {
    render(
      <PenaltyAccrualDataGrid
        label="My Accrual Grid"
        formData={{
          tableData: [
            ["2026-01-01", 12.34, 0.56, 100.12, 8.9, 5.5],
            ["2026-01-02", 11.11, 0.44, 111.23, 9.34, 5.5],
          ],
        }}
      />,
    );

    expect(screen.getByText("My Accrual Grid")).toBeVisible();
    expect(screen.getByText("2026-01-01")).toBeVisible();
    expect(screen.getByText("12.34")).toBeVisible();
    expect(screen.getByText("0.56")).toBeVisible();
    expect(screen.getByText("100.12")).toBeVisible();
    expect(screen.getByText("8.9")).toBeVisible();
    expect(screen.getByText("5.5")).toBeVisible();
    expect(screen.getByText("2026-01-02")).toBeVisible();
  });

  it("displays '-' for null, undefined, and empty string values", () => {
    render(
      <PenaltyAccrualDataGrid
        formData={{
          tableData: [["", null, undefined, "", null, undefined]],
        }}
      />,
    );

    const dashCells = screen.getAllByText("-");
    expect(dashCells.length).toBeGreaterThanOrEqual(6);
  });

  it("hides label when ui:options.label is false", () => {
    render(
      <PenaltyAccrualDataGrid
        label="Hidden label"
        uiSchema={{ "ui:options": { label: false } }}
        formData={{ tableData: [["2026-01-01", 1, 1, 1, 1, 1]] }}
      />,
    );

    expect(screen.queryByText("Hidden label")).not.toBeInTheDocument();
    expect(screen.getByText("2026-01-01")).toBeVisible();
  });
});
