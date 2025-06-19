import { render, screen } from "@testing-library/react";
import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";
import { ComplianceSummary } from "@/compliance/src/app/types";

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

  it("displays 'Request Issuance of Credits' when status is 'Earned credits'", () => {
    render(
      ActionCell(
        createMockParams(
          123,
          false,
          undefined,
          "Earned credits",
          "Credits Not Issued in BCCR",
        ),
      ),
    );
    expectLink(
      "Request Issuance of Credits",
      "/compliance-summaries/123/request-issuance-review-summary",
    );
  });

  it("displays 'Review Credits Issuance Request' when status is 'Earned credits', user is cas staff and earned credits is not actioned", () => {
    render(
      ActionCell(createMockParams(555, true, undefined, "Earned credits")),
    );
    expectLink(
      "Review Credits Issuance Request",
      "/compliance-summaries/555/request-issuance-of-earned-credits",
    );
  });

  it("displays 'View Details' when neither obligation_id nor earned credits status is present", () => {
    render(ActionCell(createMockParams(123, false)));
    expectLink("View Details", "/compliance-summaries/123");
  });

  it("prioritizes 'Manage Obligation' over 'Request Issuance' when both conditions are met", () => {
    render(
      ActionCell(
        createMockParams(
          123,
          false,
          "24-0001-1-1",
          "Earned credits",
          "Credits Not Issued in BCCR",
        ),
      ),
    );
    expectLink(
      "Manage Obligation",
      "/compliance-summaries/123/manage-obligation-review-summary",
    );
  });
});
