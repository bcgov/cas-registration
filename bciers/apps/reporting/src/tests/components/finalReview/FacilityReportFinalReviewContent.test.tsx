import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import FacilityReportFinalReviewContent from "@reporting/src/app/components/finalReview/FacilityReportFinalReviewContent";

const mockRouterPush = vi.fn();
vi.mock("next/navigation", async () => {
  const actual: any = await vi.importActual("next/navigation");
  return { ...actual, useRouter: vi.fn(() => ({ push: mockRouterPush })) };
});

vi.mock("@reporting/src/app/components/shared/FacilityReportSection", () => ({
  __esModule: true,
  default: ({ facilityData }: any) => <div>{facilityData.facility_name}</div>,
}));

const backUrl = "/reporting/reports/1/final-review#facility-grid";

describe("FacilityReportFinalReviewContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a back navigation link pointing to the correct URL", () => {
    render(
      <FacilityReportFinalReviewContent
        data={{ facility_name: "Test Facility" } as any}
        backUrl={backUrl}
      />,
    );

    const backLink = screen.getByRole("link", {
      name: /back to previous page/i,
    });
    expect(backLink).toBeVisible();
    expect(backLink).toHaveAttribute("href", backUrl);
  });

  it("renders the facility name", () => {
    render(
      <FacilityReportFinalReviewContent
        data={{ facility_name: "Test Facility" } as any}
        backUrl={backUrl}
      />,
    );

    expect(screen.getByText("Test Facility")).toBeVisible();
  });

  it("sets document.title during print and restores it after print", () => {
    const originalTitle = document.title;

    render(
      <FacilityReportFinalReviewContent
        data={{ facility_name: "Test Facility" } as any}
        backUrl={backUrl}
      />,
    );

    expect(document.title).toBe(originalTitle);

    globalThis.dispatchEvent(new Event("beforeprint"));
    expect(document.title).toBe("OBPS_Reporting_Test Facility");

    globalThis.dispatchEvent(new Event("afterprint"));
    expect(document.title).toBe(originalTitle);
  });

  it("navigates back when Back button is clicked", async () => {
    render(
      <FacilityReportFinalReviewContent
        data={{ facility_name: "Test Facility" } as any}
        backUrl={backUrl}
      />,
    );

    await act(async () => {
      screen.getByRole("button", { name: /back/i }).click();
    });

    expect(mockRouterPush).toHaveBeenCalledWith(backUrl);
  });
});
