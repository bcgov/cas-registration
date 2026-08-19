import { PenaltySummaryField } from "@/compliance/src/app/components/compliance-summary/manage-obligation/internal/review-compliance-summary/PenaltySummaryWidget";
import { render, screen } from "@testing-library/react";

describe("PenaltySummaryField", () => {
  describe("label", () => {
    it("renders default label when none is provided", () => {
      render(<PenaltySummaryField />);
      expect(screen.getByText("Penalty summary")).toBeVisible();
    });

    it("renders a custom label when provided", () => {
      render(<PenaltySummaryField label="Custom Label" />);
      expect(screen.getByText("Custom Label")).toBeVisible();
      expect(screen.queryByText("Penalty summary")).not.toBeInTheDocument();
    });
  });

  describe("total penalty amount", () => {
    it("renders '-' when total_penalty_amount is undefined", () => {
      render(<PenaltySummaryField formData={{}} />);
      expect(screen.getByText("$-")).toBeVisible();
    });

    it("renders '-' when total_penalty_amount is null", () => {
      render(<PenaltySummaryField formData={{ total_penalty_amount: null }} />);
      expect(screen.getByText("$-")).toBeVisible();
    });

    it("renders '-' when total_penalty_amount is empty string", () => {
      render(<PenaltySummaryField formData={{ total_penalty_amount: "" }} />);
      expect(screen.getByText("$-")).toBeVisible();
    });

    it("formats a numeric amount with two decimal places", () => {
      render(
        <PenaltySummaryField formData={{ total_penalty_amount: 1234.5 }} />,
      );
      expect(screen.getByText("$1,234.50")).toBeVisible();
    });

    it("formats a string numeric amount", () => {
      render(
        <PenaltySummaryField formData={{ total_penalty_amount: "9876.00" }} />,
      );
      expect(screen.getByText("$9,876.00")).toBeVisible();
    });

    it("formats a string amount that already has commas", () => {
      render(
        <PenaltySummaryField
          formData={{ total_penalty_amount: "1,000,000" }}
        />,
      );
      expect(screen.getByText("$1,000,000.00")).toBeVisible();
    });

    it("renders the raw value when it is not numeric", () => {
      render(
        <PenaltySummaryField formData={{ total_penalty_amount: "N/A" }} />,
      );
      expect(screen.getByText("$N/A")).toBeVisible();
    });

    it("formats a whole number with .00", () => {
      render(<PenaltySummaryField formData={{ total_penalty_amount: 500 }} />);
      expect(screen.getByText("$500.00")).toBeVisible();
    });
  });

  describe("days late", () => {
    it("renders '-' when days_late is undefined", () => {
      render(<PenaltySummaryField formData={{}} />);
      const daysLateCard = screen
        .getByText("Days late")
        .closest("div") as HTMLElement;
      expect(daysLateCard).toBeInTheDocument();
      expect(daysLateCard.querySelector("p.mt-1")).toHaveTextContent("-");
    });

    it("renders '-' when days_late is null", () => {
      render(<PenaltySummaryField formData={{ days_late: null }} />);
      const daysLateCard = screen
        .getByText("Days late")
        .closest("div") as HTMLElement;
      expect(daysLateCard.querySelector("p.mt-1")).toHaveTextContent("-");
    });

    it("renders the numeric days_late value", () => {
      render(<PenaltySummaryField formData={{ days_late: 30 }} />);
      expect(screen.getByText("30")).toBeVisible();
    });

    it("renders a string days_late value", () => {
      render(<PenaltySummaryField formData={{ days_late: "45" }} />);
      expect(screen.getByText("45")).toBeVisible();
    });
  });

  it("renders both cards when all data is provided", () => {
    render(
      <PenaltySummaryField
        formData={{ total_penalty_amount: 2500.75, days_late: 10 }}
        label="Overdue Penalty Summary"
      />,
    );
    expect(screen.getByText("Overdue Penalty Summary")).toBeVisible();
    expect(screen.getByText("$2,500.75")).toBeVisible();
    expect(screen.getByText("Total penalty amount")).toBeVisible();
    expect(screen.getByText("10")).toBeVisible();
    expect(screen.getByText("Days late")).toBeVisible();
  });

  it("renders safely with no props", () => {
    render(<PenaltySummaryField />);
    expect(screen.getByText("Penalty summary")).toBeVisible();
    expect(screen.getByText("$-")).toBeVisible();
  });
});
