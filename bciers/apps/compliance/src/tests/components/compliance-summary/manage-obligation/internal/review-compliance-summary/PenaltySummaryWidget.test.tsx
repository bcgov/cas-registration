import { render, screen } from "@testing-library/react";
import { PenaltySummaryField } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltySummaryField";

const formData = { total_penalty_amount: "1234.5", days_late: 12 };

describe("PenaltySummaryField", () => {
  it("renders the default label", () => {
    render(<PenaltySummaryField formData={formData} />);
    expect(screen.getByText("Penalty summary")).toBeVisible();
  });

  it("renders a custom label when provided", () => {
    render(<PenaltySummaryField formData={formData} label="Custom Label" />);
    expect(screen.getByText("Custom Label")).toBeVisible();
    expect(screen.queryByText("Penalty summary")).not.toBeInTheDocument();
  });

  it("renders the penalty amount as currency and the days late", () => {
    render(<PenaltySummaryField formData={formData} />);

    expect(screen.getByText("Total penalty amount")).toBeVisible();
    expect(screen.getByText("$1,234.50")).toBeVisible();
    expect(screen.getByText("Days late")).toBeVisible();
    expect(screen.getByText("12")).toBeVisible();
  });

  it("falls back to zero when the field has no data", () => {
    render(<PenaltySummaryField />);

    expect(screen.getByText("$0.00")).toBeVisible();
    expect(screen.getByText("0")).toBeVisible();
  });
});
