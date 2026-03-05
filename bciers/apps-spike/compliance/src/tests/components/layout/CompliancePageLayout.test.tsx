import { render, screen } from "@testing-library/react";
import CompliancePageLayout from "@/compliance/src/app/components/layout/CompliancePageLayout";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

// Mock the CompliancePageHeading component
vi.mock("@/compliance/src/app/components/layout/CompliancePageHeading", () => ({
  default: () => <h2>Operation XYZ</h2>,
}));

// Mock the ComplianceSummaryTaskList component
vi.mock(
  "@bciers/components/navigation/complianceSummaryTaskList/ComplianceSummaryTaskList",
  () => ({
    default: ({ elements }: { elements: TaskListElement[] }) => (
      <nav>Navigation Menu ({elements.length} items)</nav>
    ),
  }),
);

const mockProps = {
  complianceReportVersionId: 123,
  taskListElements: [
    {
      type: "Section" as const,
      title: "Test Section",
      elements: [
        {
          type: "Page" as const,
          title: "Test Page",
          link: "/test",
          isActive: true,
        },
      ],
    },
  ],
  children: <>Page Content</>,
};

describe("CompliancePageLayout", () => {
  it("renders all components in the correct structure", () => {
    render(<CompliancePageLayout {...mockProps} />);

    // Check heading
    expect(screen.getByText("Operation XYZ")).toBeVisible();

    // Check task list
    const taskList = screen.getByText("Navigation Menu (1 items)");
    expect(taskList).toBeVisible();

    // Check content
    expect(screen.getByText("Page Content")).toBeVisible();
  });
});
