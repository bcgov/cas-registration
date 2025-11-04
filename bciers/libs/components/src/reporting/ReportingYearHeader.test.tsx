import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReportingYearHeader from "./ReportingYearHeader";

describe("ReportingYearHeader", () => {
  describe("Dashboard variant", () => {
    it("renders the reporting year and due date in stacked layout", () => {
      render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="dashboard"
        />,
      );

      expect(
        screen.getByRole("heading", { name: /reporting year 2024/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/reports due/i)).toBeInTheDocument();
      expect(screen.getByText(/may 31, 2025/i)).toBeInTheDocument();
    });

    it("renders without info box by default", () => {
      render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="dashboard"
        />,
      );

      expect(
        screen.queryByText(/ensure operation information is up to date/i),
      ).not.toBeInTheDocument();
    });

    it("renders with info box when showInfoBox is true", () => {
      render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="dashboard"
          showInfoBox={true}
        />,
      );

      expect(
        screen.getByText(/ensure operation information is up to date/i),
      ).toBeInTheDocument();
    });

    it("renders info box with proper styling when enabled", () => {
      const { container } = render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="dashboard"
          showInfoBox={true}
        />,
      );

      const paper = container.querySelector(".MuiPaper-root");
      expect(paper).toBeInTheDocument();

      // Check for InfoIcon
      const icon = container.querySelector('svg[data-testid="InfoIcon"]');
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Inline variant", () => {
    it("renders the reporting year and due date side by side", () => {
      render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="inline"
        />,
      );

      const h2 = screen.getByRole("heading", {
        level: 2,
        name: /reporting year 2024/i,
      });
      const h3 = screen.getByRole("heading", {
        level: 3,
        name: /reports due may 31, 2025/i,
      });

      expect(h2).toBeInTheDocument();
      expect(h3).toBeInTheDocument();
    });

    it("does not render info box in inline variant even if showInfoBox is true", () => {
      render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="inline"
          showInfoBox={true}
        />,
      );

      expect(
        screen.queryByText(/ensure operation information is up to date/i),
      ).not.toBeInTheDocument();
    });

    it("uses flex layout for inline variant", () => {
      const { container } = render(
        <ReportingYearHeader
          reportingYear={2024}
          reportDueYear={2025}
          variant="inline"
        />,
      );

      const wrapper = container.querySelector(".flex.justify-between");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Default behavior", () => {
    it("uses dashboard variant by default", () => {
      render(<ReportingYearHeader reportingYear={2024} reportDueYear={2025} />);

      // Dashboard variant has a paragraph for due date
      expect(screen.getByText(/reports due/i).tagName).toBe("P");
    });

    it("handles different year values correctly", () => {
      render(
        <ReportingYearHeader
          reportingYear={2023}
          reportDueYear={2024}
          variant="dashboard"
        />,
      );

      expect(
        screen.getByRole("heading", { name: /reporting year 2023/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/may 31, 2024/i)).toBeInTheDocument();
    });

    it("handles future years correctly", () => {
      render(
        <ReportingYearHeader
          reportingYear={2030}
          reportDueYear={2031}
          variant="inline"
        />,
      );

      expect(
        screen.getByRole("heading", { name: /reporting year 2030/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/may 31, 2031/i)).toBeInTheDocument();
    });
  });
});
