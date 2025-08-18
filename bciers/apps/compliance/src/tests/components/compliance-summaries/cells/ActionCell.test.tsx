import { render, screen } from "@testing-library/react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";
import { ComplianceSummary } from "@/compliance/src/app/types";
import { IssuanceStatus } from "@bciers/utils/src/enums";

describe("ActionCell", () => {
  interface ActionCellParams extends GridRenderCellParams {
    id: number;
    isAllowedCas: boolean;
    obligation_id?: string;
    status?: string;
    issuance_status?: string;
  }

  const createMockParams = (
    id: number,
    isAllowedCas: boolean,
    obligation_id?: string,
    status?: string,
    issuance_status?: string,
  ): ActionCellParams =>
    ({
      id: id,
      row: {
        id,
        obligation_id,
        status,
        issuance_status,
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
          "/compliance-summaries/123/manage-obligation-review-summary",
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
          "/compliance-summaries/123/review-obligation-summary",
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
          "/compliance-summaries/123/review-obligation-summary",
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
          "/compliance-summaries/123/request-issuance-review-summary",
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
          "/compliance-summaries/123/request-issuance-review-summary",
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
          "/compliance-summaries/123/request-issuance-review-summary",
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
          "/compliance-summaries/123/track-status-of-issuance",
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
          "/compliance-summaries/123/track-status-of-issuance",
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
          "/compliance-summaries/123/request-issuance-review-summary",
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
          "/compliance-summaries/123/request-issuance-review-summary",
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
          "View Details",
          "/compliance-summaries/123/request-issuance-review-summary",
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
          "/compliance-summaries/123/track-status-of-issuance",
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
          "/compliance-summaries/123/track-status-of-issuance",
        );
      });
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
      expectLink("View Details", "/compliance-summaries/123/review-summary");
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
      expectLink("View Details", "/compliance-summaries/123/review-summary");
    });
  });
});
