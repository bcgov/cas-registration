import { vi } from "vitest";

// Mock next/navigation's redirect
vi.mock("next/navigation", () => ({
  permanentRedirect: vi.fn(),
}));

import { permanentRedirect } from "next/navigation";
import ReportsPage from "@reporting/src/app/bceidbusiness/industry_user/reports/page";

describe("ReportsPage redirect", () => {
  it("calls redirect to /reports/current-reports", () => {
    ReportsPage();
    expect(permanentRedirect).toHaveBeenCalledWith("/reports/current-reports");
  });
});
