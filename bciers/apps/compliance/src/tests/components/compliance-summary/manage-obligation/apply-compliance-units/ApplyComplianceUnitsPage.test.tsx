import { render, screen } from "@testing-library/react";
import ApplyComplianceUnitsPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsPage";
import {
  generateManageObligationTaskList,
  ActivePage,
} from "@/compliance/src/app/components/taskLists/1_manageObligationTaskList";

// Mock the task list generator
vi.mock(
  "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
  () => ({
    generateManageObligationTaskList: vi.fn(),
    ActivePage: { ApplyComplianceUnits: 0 },
  }),
);

// Mock the layout component
vi.mock("@/compliance/src/app/components/layout/CompliancePageLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>Mock Layout {children}</div>
  ),
}));

// Mock the main component
vi.mock(
  "@/compliance/src/app/components/compliance-summary/manage-obligation/apply-compliance-units/ApplyComplianceUnitsComponent",
  () => ({
    default: () => <div>Mock Apply Component</div>,
  }),
);

describe("ApplyComplianceUnitsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with correct components and generates task list", async () => {
    render(await ApplyComplianceUnitsPage({ compliance_summary_id: "123" }));

    // Check components are rendered
    expect(screen.getByText("Mock Layout")).toBeVisible();
    expect(screen.getByText("Mock Apply Component")).toBeVisible();

    // Verify task list generation
    expect(generateManageObligationTaskList).toHaveBeenCalledWith(
      "123",
      "2025",
      ActivePage.ApplyComplianceUnits,
    );
  });
});
