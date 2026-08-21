import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { Mock } from "vitest";
import { useRouter, useSessionRole } from "@bciers/testConfig/mocks";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import InternalManualHandlingComponent from "@/compliance/src/app/components/compliance-summary/manual-handling/internal/InternalManualHandlingComponent";
import { ManualHandlingData } from "@/compliance/src/app/types";
import { actionHandler } from "@bciers/actions";
import expectRadio from "@bciers/testConfig/helpers/expectRadio";

// Mock actionHandler so submit doesn't actually call the API
vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

// Router mock for Back navigation
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockRouterPush,
});

const CRV_ID = 123;

const baseFormData: ManualHandlingData = {
  handling_type: "earned_credits",
  analyst_comment: "Initial analyst comment",
  analyst_submitted_date: null,
  analyst_submitted_by: null,
  director_decision: "pending_manual_handling",
  director_decision_date: null,
  director_decision_by: null,
};

describe("InternalManualHandlingComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue(FrontEndRoles.CAS_ANALYST);
    mockRouterPush.mockClear();
    (actionHandler as unknown as Mock).mockResolvedValue({ error: null });
  });

  it("renders the internal manual handling form with title and section header", () => {
    render(
      <InternalManualHandlingComponent
        initialFormData={baseFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    // Title from schema
    expect(screen.getByText("Resolve Issue")).toBeVisible();

    // Section header from readOnlyObjectField
    expect(
      screen.getByText(
        "Manual Handling of Supplementary Report (Out of BCIERS)",
      ),
    ).toBeVisible();

    // Analyst's Comment label should be visible
    expect(screen.getByText("Analyst's Comment:")).toBeVisible();

    // Director's Decision label should be visible
    expect(screen.getByText("Director's Decision:")).toBeVisible();

    // Submit button visible for CAS analyst when director_decision is pending
    expect(screen.getByRole("button", { name: "Submit" })).toBeVisible();
  });

  it("hides the Submit button for CAS analysts when the director has resolved the issue", () => {
    const resolvedFormData: ManualHandlingData = {
      ...baseFormData,
      director_decision: "issue_resolved",
    };

    render(
      <InternalManualHandlingComponent
        initialFormData={resolvedFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    // For CAS analyst + initial director_decision === "issue_resolved",
    // the component should hide the Submit button entirely
    expect(screen.queryByRole("button", { name: "Submit" })).toBeNull();
  });

  it("shows the resolved note text when initial director_decision is issue_resolved", () => {
    const resolvedFormData: ManualHandlingData = {
      ...baseFormData,
      director_decision: "issue_resolved",
    };

    render(
      <InternalManualHandlingComponent
        initialFormData={resolvedFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    // InternalIssueResolvedNote widget text
    expect(screen.getByText("The issue has been resolved.")).toBeVisible();
  });

  it("navigates back to the compliance summaries grid when Back is clicked", () => {
    render(
      <InternalManualHandlingComponent
        initialFormData={baseFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    const backButton = screen.getByRole("button", { name: "Back" });
    expect(backButton).toBeVisible();

    fireEvent.click(backButton);

    expect(mockRouterPush).toHaveBeenCalledWith(
      "/compliance-administration/compliance-summaries",
    );
  });

  it("shows the director's decision as read-only text for CAS analysts", () => {
    render(
      <InternalManualHandlingComponent
        initialFormData={baseFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    expect(screen.getByText("Pending manual handling")).toBeVisible();
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("shows the director's decision as radio options for CAS directors", () => {
    useSessionRole.mockReturnValue(FrontEndRoles.CAS_DIRECTOR);

    render(
      <InternalManualHandlingComponent
        initialFormData={baseFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    expect(screen.getByText("Pending manual handling")).toBeVisible();
    expect(screen.getByText("Issue has been resolved")).toBeVisible();
    expectRadio(/Pending manual handling/i);
    expectRadio(/Issue has been resolved/i);
  });

  it("submits updated analyst_comment and director_decision when Submit is clicked", async () => {
    render(
      <InternalManualHandlingComponent
        initialFormData={baseFormData}
        complianceReportVersionId={CRV_ID}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });
    expect(submitButton).toBeVisible();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        `compliance/compliance-report-versions/${CRV_ID}/manual-handling`,
        "PUT",
        "/compliance-administration/compliance-summaries",
        {
          body: JSON.stringify({
            analyst_comment: "Initial analyst comment",
            director_decision: "pending_manual_handling",
          }),
        },
      );
    });
  });
});
