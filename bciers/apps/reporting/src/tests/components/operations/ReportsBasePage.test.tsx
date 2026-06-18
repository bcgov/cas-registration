import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import ReportsBasePage from "@reporting/src/app/components/operations/ReportsBasePage";

vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(() =>
    Promise.resolve({
      reporting_year: 2024,
      report_due_date: "2025-05-31",
      reporting_window_end: "2025-03-31",
      report_due_year: 2025,
    }),
  ),
}));

describe("ReportsBasePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("For industry users", () => {
    it("renders inline reporting year header for industry_user on current reports tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "industry_user",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      // Check for both h2 (reporting year) and h3 (due date) in inline variant
      expect(
        screen.getByRole("heading", { level: 2, name: /reporting year 2024/i }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /reports due may 31, 2025/i,
        }),
      ).toBeVisible();
    });

    it("renders inline reporting year header for industry_user_admin on current reports tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "industry_user_admin",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("heading", { level: 2, name: /reporting year 2024/i }),
      ).toBeVisible();
      expect(
        screen.getByRole("heading", {
          level: 3,
          name: /reports due may 31, 2025/i,
        }),
      ).toBeVisible();
    });

    it("renders previous reporting years title on previous reporting years tab for industry users", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "industry_user",
      );

      render(
        await ReportsBasePage({
          activeTab: 1,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("heading", { name: /previous reporting years/i }),
      ).toBeVisible();
      // Should not show the due date when not on current reports tab
      expect(
        screen.queryByText(/reports due may 31, 2025/i),
      ).not.toBeInTheDocument();
    });

    it("renders correct tabs for industry users", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "industry_user",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("tab", { name: /current reporting year/i }),
      ).toBeVisible();
      expect(
        screen.getByRole("tab", { name: /previous reporting years/i }),
      ).toBeVisible();
      // Industry users should not see attachments tab
      expect(
        screen.queryByRole("tab", { name: /download report attachments/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("For internal users", () => {
    it("renders regular page title for cas_admin on current reports tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_admin",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("heading", { name: /reporting year 2024/i }),
      ).toBeVisible();
      // Should not show the inline due date for internal users
      expect(
        screen.queryByRole("heading", { level: 3, name: /reports due/i }),
      ).not.toBeInTheDocument();
    });

    it("renders regular page title for cas_analyst on current reports tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_analyst",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("heading", { name: /reporting year 2024/i }),
      ).toBeVisible();
    });

    it("renders correct tabs for internal users including attachments", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_admin",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("tab", { name: /current reporting year/i }),
      ).toBeVisible();
      expect(
        screen.getByRole("tab", { name: /previous reporting years/i }),
      ).toBeVisible();
      expect(
        screen.getByRole("tab", { name: /download report attachments/i }),
      ).toBeVisible();
    });

    it("renders Download Report Attachments title for attachments tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_admin",
      );

      render(
        await ReportsBasePage({
          activeTab: 2,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("heading", {
          name: /download report attachments/i,
        }),
      ).toBeVisible();
    });

    it("renders Previous Reporting Years title on previous reporting years tab for internal users", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_analyst",
      );

      render(
        await ReportsBasePage({
          activeTab: 1,
          children: <div>Test Children</div>,
        }),
      );

      expect(
        screen.getByRole("heading", { name: /previous reporting years/i }),
      ).toBeVisible();
    });
  });

  describe("Children rendering", () => {
    it("renders children content", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_admin",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div data-testid="child-content">Test Content</div>,
        }),
      );

      expect(screen.getByTestId("child-content")).toBeVisible();
      expect(screen.getByText("Test Content")).toBeVisible();
    });
  });

  describe("Tab navigation", () => {
    it("has correct href for current reports tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "industry_user",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      const tab = screen.getByRole("tab", {
        name: /current reporting year/i,
      });
      expect(tab).toHaveAttribute("href", "/reports/current-reports");
    });

    it("has correct href for previous reporting years tab", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "industry_user",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      const tab = screen.getByRole("tab", {
        name: /previous reporting years/i,
      });
      expect(tab).toHaveAttribute("href", "/reports/previous-years");
    });

    it("has correct href for attachments tab for internal users", async () => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
        "cas_admin",
      );

      render(
        await ReportsBasePage({
          activeTab: 0,
          children: <div>Test Children</div>,
        }),
      );

      const tab = screen.getByRole("tab", {
        name: /download report attachments/i,
      });
      expect(tab).toHaveAttribute("href", "/reports/attachments");
    });
  });
});
