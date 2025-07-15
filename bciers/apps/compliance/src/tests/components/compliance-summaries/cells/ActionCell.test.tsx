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
      row: { id, obligation_id, status, issuance_status } as ComplianceSummary,
      isAllowedCas: isAllowedCas,
    }) as ActionCellParams;

  const expectLink = (name: string, href: string) => {
    const link = screen.getByRole("link", { name });
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", href);
  };

  // Test cases for obligation rows
  describe("Obligation Flow", () => {
    it("displays 'Manage Obligation' when obligation_id is present", () => {
      render(
        ActionCell(
          createMockParams(123, false, "24-0001-1-1", undefined, undefined),
        ),
      );
      expectLink(
        "Manage Obligation",
        "/compliance-summaries/123/manage-obligation-review-summary",
      );
    });
  });

  // Test cases for earned credits flow
  describe("Earned Credits Flow", () => {
    it("displays 'Review Credits Issuance Request' for CAS user when no final decision", () => {
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

    it("displays 'Review Credits Issuance Request' when status is 'Earned credits', user is cas staff and earned credits is not actioned", () => {
      render(
        ActionCell(createMockParams(555, true, undefined, "Earned credits")),
      );
      expectLink(
        "Review Credits Issuance Request",
        "/compliance-summaries/555/request-issuance-review-summary",
      );
    });

    it("displays 'View Details' for internal user when declined", () => {
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
        "/compliance-summaries/123/request-issuance-review-summary",
      );
    });

    it("displays 'View Details' for external user when request is submitted", () => {
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
  });

  it("prioritizes 'Manage Obligation' over other conditions", () => {
    render(
      ActionCell(
        createMockParams(
          123,
          false,
          "24-0001-1-1",
          "Earned credits",
          IssuanceStatus.ISSUANCE_REQUESTED,
        ),
      ),
    );
    expectLink(
      "Manage Obligation",
      "/compliance-summaries/123/manage-obligation-review-summary",
    );
  });
});
