import { render, screen, fireEvent } from "@testing-library/react";
import { useRouter, useSessionRole } from "@bciers/testConfig/mocks";
import ComplianceSummaryReviewComponent from "@/compliance/src/app/components/compliance-summary/no-obligation/review-summary/ComplianceSummaryReviewComponent";

// Mock the router
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

// Mock breadcrumb hook
vi.mock("@bciers/components", async () => {
  const actual =
    await vi.importActual<typeof import("@bciers/components")>(
      "@bciers/components",
    );
  return {
    ...actual,
    useBreadcrumb: () => ({ lastTitle: null, setLastTitle: vi.fn() }),
  };
});

const mockData = {
  reporting_year: 2024,
  id: 123,
};

describe("ComplianceSummaryReviewComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user");
  });

  it("renders the form with correct schema fields and headers", () => {
    render(<ComplianceSummaryReviewComponent data={mockData} />);

    // Check form title
    expect(screen.getByText("Review 2024 Compliance Report")).toBeVisible();

    // Check alert note
    const alertNote = screen.getByRole("alert");
    expect(alertNote).toBeVisible();
    expect(alertNote).toHaveTextContent(
      "No compliance obligation or earned credits for this operation over the 2024 compliance period.",
    );
  });

  it("renders back button with correct urls", () => {
    render(<ComplianceSummaryReviewComponent data={mockData} />);

    // Check button text and states
    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();
    expect(backButton).not.toBeDisabled();

    const continueButton = screen.queryByRole("button", { name: "Continue" });
    expect(continueButton).toBeNull();

    // Verify router push is called with correct URLs when buttons are clicked
    fireEvent.click(backButton);
    expect(mockRouterPush).toHaveBeenCalledWith("/compliance-summaries");
  });
});
