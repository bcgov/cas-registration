import React from "react";
import { render, screen } from "@testing-library/react";

// 1) Mock next/navigation
vi.mock("next/navigation", async () => {
  const actual =
    await vi.importActual<typeof import("next/navigation")>("next/navigation");
  return {
    ...actual,
    useSelectedLayoutSegments: vi.fn(), // we'll grab this mock below
  };
});

// 2) Mock lightweight UI deps used by the alert
vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alertnote">{children}</div>
  ),
}));
vi.mock("@bciers/components/icons", () => ({ AlertIcon: () => null }));
vi.mock("@bciers/styles", () => ({ BC_GOV_YELLOW: "#ffd75e" }));

// 3) Mock the server util that the layout calls
vi.mock(
  "@/compliance/src/app/utils/getElicensingLastRefreshedMetaData",
  () => ({
    getElicensingLastRefreshedMetaData: vi.fn(),
  }),
);

// 4) Import the mocked symbols and get typed mock handles
import { useSelectedLayoutSegments } from "next/navigation";
const mockUseSelectedLayoutSegments = vi.mocked(useSelectedLayoutSegments);

import { getElicensingLastRefreshedMetaData } from "@/compliance/src/app/utils/getElicensingLastRefreshedMetaData";
const mockGetMeta = vi.mocked(getElicensingLastRefreshedMetaData);

// 5) Import the server layout AFTER mocks
import ManageObligationLayout from "@/compliance/src/app/components/layout/ManageObligationLayout";

describe("ManageObligationLayout + ElicensingStaleDataAlert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to a non-excluded leaf
    mockUseSelectedLayoutSegments.mockReturnValue([
      "manage-obligation-review-summary",
    ]);
  });

  it("hides the alert on excluded leaf (ex: download-payment-instructions)", async () => {
    // Even if backend says stale, excluded leaf should hide alert
    mockGetMeta.mockResolvedValue({
      last_refreshed_display: "Aug 27, 2025 6:48 a.m. PDT",
      data_is_fresh: false,
    });

    // Simulate current leaf = excluded page
    mockUseSelectedLayoutSegments.mockReturnValue([
      "download-payment-instructions",
    ]);

    const ui = await ManageObligationLayout({
      complianceReportVersionId: 2,
      children: <div data-testid="child">child</div>,
    });

    render(ui);

    expect(mockGetMeta).toHaveBeenCalledWith(2);
    expect(screen.queryByTestId("alertnote")).toBeNull(); // hidden
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("shows the alert when data is stale on a non-excluded leaf", async () => {
    mockGetMeta.mockResolvedValue({
      last_refreshed_display: "Aug 27, 2025 6:48 a.m. PDT",
      data_is_fresh: false,
    });

    mockUseSelectedLayoutSegments.mockReturnValue([
      "manage-obligation-review-summary",
    ]);

    const ui = await ManageObligationLayout({
      complianceReportVersionId: 2,
      children: <div data-testid="child">child</div>,
    });

    render(ui);

    expect(mockGetMeta).toHaveBeenCalledWith(2);
    expect(screen.getByTestId("alertnote")).toHaveTextContent(
      "Invoice data last updated",
    );
    expect(screen.getByTestId("alertnote")).toHaveTextContent(
      "Aug 27, 2025 6:48 a.m. PDT",
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("does not show the alert when data is fresh on a non-excluded leaf", async () => {
    mockGetMeta.mockResolvedValue({
      last_refreshed_display: "Aug 27, 2025 6:48 a.m. PDT",
      data_is_fresh: true,
    });

    mockUseSelectedLayoutSegments.mockReturnValue([
      "manage-obligation-review-summary",
    ]);

    const ui = await ManageObligationLayout({
      complianceReportVersionId: 2,
      children: <div data-testid="child">child</div>,
    });

    render(ui);

    expect(mockGetMeta).toHaveBeenCalledWith(2);
    expect(screen.queryByTestId("alertnote")).toBeNull(); // fresh => hidden
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
