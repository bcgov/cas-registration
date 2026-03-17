import { render, screen } from "@testing-library/react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";
import { ComplianceSummary } from "@/compliance/src/app/types";
import {
  ComplianceSummaryStatus,
  IssuanceStatus,
  PenaltyStatus,
} from "@bciers/utils/src/enums";

describe("ActionCell", () => {
  interface ActionCellParams extends GridRenderCellParams {
    id: number;
    isAllowedCas: boolean;
    obligation_id?: string;
    status?: string;
    issuance_status?: string;
    requires_manual_handling?: boolean;
    director_decision?: "pending_manual_handling" | "issue_resolved";
  }

  const createMockParams = (
    id: number,
    isAllowedCas: boolean,
    obligation_id?: string,
    status?: string,
    issuance_status?: string,
    penalty_status?: PenaltyStatus,
    requires_manual_handling?: boolean,
    director_decision?: "pending_manual_handling" | "issue_resolved",
  ): ActionCellParams =>
    ({
      id: id,
      row: {
        id,
        obligation_id,
        status,
        issuance_status,
        penalty_status,
        requires_manual_handling,
        director_decision,
      } as ComplianceSummary,
      isAllowedCas: isAllowedCas,
    }) as ActionCellParams;

  const expectLink = (name: string, href: string) => {
    const link = screen.getByRole("link", { name });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", href);
  };

  // Test cases for obligation rows
  describe("Obligation Flow", () => {
    describe("External users (isAllowedCas: false)", () => {
      it("displays 'Manage Obligation' when obligation & invoice exist and status is obligation not met", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              "24-0001-1-1",
              "Obligation not met",
              undefined,
            ),
          ),
        );
        expectLink(
          "Manage Obligation",
          "/compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
        );
      });

      it("displays 'Manage Obligation' when obligation is fully met and penalty is accruing for external user", () => {
        const params = createMockParams(
          123,
          false,
          "24-0001-1-1",
          "Obligation fully met",
          undefined,
          PenaltyStatus.ACCRUING,
        );

        render(ActionCell(params));
        expectLink(
          "Manage Obligation",
          "/compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
        );
      });

      it("displays 'View Details' when obligation & invoice exist and status is obligation met", () => {
        render(
          ActionCell(
            createMockParams(123, false, "24-0001-1-1", "Obligation fully met"),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
        );
      });

      it("displays 'Pending Invoice Creation' when status is 'Obligation pending invoice creation'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              "24-0001-1-1",
              "Obligation pending invoice creation",
            ),
          ),
        );
        expectLink("Pending Invoice Creation", "#");
      });
    });

    describe("Internal users (isAllowedCas: true)", () => {
      it("displays 'View Details' with review-obligation path when obligation is not met", () => {
        render(
          ActionCell(
            createMockParams(123, true, "24-0001-1-1", "Obligation not met"),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
        );
      });

      it("displays 'View Details' with review-compliance-obligation-report path when obligation is fully met", () => {
        render(
          ActionCell(
            createMockParams(123, true, "24-0001-1-1", "Obligation fully met"),
          ),
        );

        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/review-compliance-obligation-report",
        );
      });

      it("displays 'Pending Invoice Creation' when status is 'Obligation pending invoice creation'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              true,
              "24-0001-1-1",
              "Obligation pending invoice creation",
            ),
          ),
        );
        expectLink("Pending Invoice Creation", "#");
      });
    });
  });

  // Test cases for earned credits flow
  describe("Earned Credits Flow", () => {
    describe("Internal users (isAllowedCas: true)", () => {
      it("displays 'Review Credits Issuance Request' when issuance status is 'Issuance Requested'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              true,
              undefined,
              "Earned credits",
              IssuanceStatus.ISSUANCE_REQUESTED,
            ),
          ),
        );
        expectLink(
          "Review Credits Issuance Request",
          "/compliance-administration/compliance-summaries/123/review-compliance-earned-credits-report",
        );
      });

      it("displays 'View Details' when issuance status is 'Credits Not Issued in BCCR'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              true,
              undefined,
              "Earned credits",
              IssuanceStatus.CREDITS_NOT_ISSUED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/review-compliance-earned-credits-report",
        );
      });

      it("displays 'View Details' when issuance status is 'Changes Required'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              true,
              undefined,
              "Earned credits",
              IssuanceStatus.CHANGES_REQUIRED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/review-compliance-earned-credits-report",
        );
      });

      it("displays 'View Details' with track-status path when issuance status is 'Approved'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              true,
              undefined,
              "Earned credits",
              IssuanceStatus.APPROVED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/track-status-of-issuance",
        );
      });

      it("displays 'View Details' with track-status path when issuance status is 'Declined'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              true,
              undefined,
              "Earned credits",
              IssuanceStatus.DECLINED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/track-status-of-issuance",
        );
      });
    });

    describe("External users (isAllowedCas: false)", () => {
      it("displays 'Request Issuance of Credits' when issuance status is 'Credits Not Issued in BCCR'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              undefined,
              "Earned credits",
              IssuanceStatus.CREDITS_NOT_ISSUED,
            ),
          ),
        );
        expectLink(
          "Request Issuance of Credits",
          "/compliance-administration/compliance-summaries/123/review-compliance-earned-credits-report",
        );
      });

      it("displays 'View Details' when issuance status is 'Issuance Requested'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              undefined,
              "Earned credits",
              IssuanceStatus.ISSUANCE_REQUESTED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/review-compliance-earned-credits-report",
        );
      });

      it("displays 'View Details' when issuance status is 'Changes Required'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              undefined,
              "Earned credits",
              IssuanceStatus.CHANGES_REQUIRED,
            ),
          ),
        );
        expectLink(
          "Review Change Required",
          "/compliance-administration/compliance-summaries/123/request-issuance-of-earned-credits",
        );
      });

      it("displays 'View Details' with track-status path when issuance status is 'Approved'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              undefined,
              "Earned credits",
              IssuanceStatus.APPROVED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/track-status-of-issuance",
        );
      });

      it("displays 'View Details' with track-status path when issuance status is 'Declined'", () => {
        render(
          ActionCell(
            createMockParams(
              123,
              false,
              undefined,
              "Earned credits",
              IssuanceStatus.DECLINED,
            ),
          ),
        );
        expectLink(
          "View Details",
          "/compliance-administration/compliance-summaries/123/track-status-of-issuance",
        );
      });
    });
  });

  // Test cases for manual handling flow
  describe("Manual Handling (director_decision + requires_manual_handling)", () => {
    it("renders non-clickable 'Contact Us' when manual handling is pending for external users", () => {
      render(
        ActionCell(
          createMockParams(
            123,
            false, // external user
            undefined, // obligation_id
            "Other status", // status
            undefined, // issuance_status
            undefined, // penalty_status
            true, // requires_manual_handling
            "pending_manual_handling", // director_decision
          ),
        ),
      );

      // Text is present…
      expect(screen.getByText("Contact Us")).toBeVisible();
      // …but not a link
      expect(screen.queryByRole("link", { name: "Contact Us" })).toBeNull();
      // And no Resolve Issue link either
      expect(screen.queryByRole("link", { name: "Resolve Issue" })).toBeNull();
    });

    it("renders 'Resolve Issue' link to resolve-issue for CAS users when manual handling is pending", () => {
      render(
        ActionCell(
          createMockParams(
            456,
            true, // internal CAS user
            "24-0001-1-1", // obligation exists (ignored in favour of manual handling)
            ComplianceSummaryStatus.OBLIGATION_NOT_MET,
            undefined,
            undefined,
            true, // requires_manual_handling
            "pending_manual_handling", // director_decision
          ),
        ),
      );

      // Should show a clickable Resolve Issue link
      const link = screen.getByRole("link", { name: "Resolve Issue" });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute(
        "href",
        "/compliance-administration/compliance-summaries/456/resolve-issue",
      );

      // And not show the Contact Us non-link label in this case
      expect(screen.queryByText("Contact Us")).toBeNull();
    });

    it("renders non-clickable 'Issue Resolved' for external users when director_decision is issue_resolved", () => {
      render(
        ActionCell(
          createMockParams(
            789,
            false, // external user
            undefined,
            "Other status",
            undefined,
            undefined,
            false, // requires_manual_handling
            "issue_resolved",
          ),
        ),
      );

      // Shows Issue Resolved as plain text
      expect(screen.getByText("Issue Resolved")).toBeVisible();
      // No link for Issue Resolved
      expect(screen.queryByRole("link", { name: "Issue Resolved" })).toBeNull();
      // No Contact Us / Resolve Issue links either
      expect(screen.queryByRole("link", { name: "Contact Us" })).toBeNull();
      expect(screen.queryByRole("link", { name: "Resolve Issue" })).toBeNull();
    });

    it("renders 'View Detail' link to resolve-issue for CAS users when director_decision is issue_resolved", () => {
      render(
        ActionCell(
          createMockParams(
            999,
            true, // CAS user
            "24-0001-1-1",
            ComplianceSummaryStatus.OBLIGATION_NOT_MET,
            undefined,
            undefined,
            false, // requires_manual_handling (ignored when director_decision is issue_resolved)
            "issue_resolved",
          ),
        ),
      );

      const link = screen.getByRole("link", { name: "View Detail" });
      expect(link).toBeVisible();
      expect(link).toHaveAttribute(
        "href",
        "/compliance-administration/compliance-summaries/999/resolve-issue",
      );

      // Should not show Contact Us or Resolve Issue in this state
      expect(screen.queryByText("Contact Us")).toBeNull();
      expect(screen.queryByText("Resolve Issue")).toBeNull();
    });
  });

  describe("Default Flow", () => {
    it("displays 'View Details' for external user when status is not earned credits", () => {
      render(
        ActionCell(
          createMockParams(
            123,
            false,
            undefined,
            "Other status",
            IssuanceStatus.ISSUANCE_REQUESTED,
          ),
        ),
      );
      expectLink(
        "View Details",
        "/compliance-administration/compliance-summaries/123/review-compliance-no-obligation-report",
      );
    });

    it("displays 'View Details' for internal user when status is not earned credits", () => {
      render(
        ActionCell(
          createMockParams(
            123,
            true,
            undefined,
            "Other status",
            IssuanceStatus.ISSUANCE_REQUESTED,
          ),
        ),
      );
      expectLink(
        "View Details",
        "/compliance-administration/compliance-summaries/123/review-compliance-no-obligation-report",
      );
    });
  });
});
