import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GridRenderCellParams } from "@mui/x-data-grid";
import ActionCell from "../../../../app/components/compliance-summaries/cells/ActionCell";
import Link from "next/link";

vi.mock("@bciers/components/datagrid/cells/ActionCellFactory", () => ({
  default: vi.fn().mockImplementation(({ generateHref, cellText }) => {
    const ActionCellComponent = (params: GridRenderCellParams) => {
      const href = generateHref(params);
      return (
        <Link href={href} className="action-cell-text">
          {cellText}
        </Link>
      );
    };
    ActionCellComponent.displayName = "ActionCellComponent";
    return ActionCellComponent;
  }),
}));

vi.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} data-testid="action-link">
      {children}
    </a>
  );

  // Add display name to fix the linting error
  MockLink.displayName = "MockLink";

  return {
    __esModule: true,
    default: MockLink,
  };
});

describe("ActionCell", () => {
  const createMockParams = (
    id: number = 123,
    obligation_id?: number,
    compliance_status?: string,
  ): GridRenderCellParams => {
    return {
      row: {
        id,
        obligation_id,
        compliance_status,
      },
    } as GridRenderCellParams;
  };

  it("should display 'Manage Obligation' when obligation_id is present", () => {
    const mockParams = createMockParams(123, 456);

    render(ActionCell(mockParams));

    expect(screen.getByTestId("action-link")).toHaveTextContent(
      "Manage Obligation",
    );

    expect(screen.getByTestId("action-link")).toHaveAttribute(
      "href",
      "/compliance-summaries/123/manage-obligation/review-compliance-summary",
    );
  });

  it("should display 'Request Issuance of Credits' when compliance_status is 'Earned credits'", () => {
    const mockParams = createMockParams(123, undefined, "Earned credits");

    render(ActionCell(mockParams));

    expect(screen.getByTestId("action-link")).toHaveTextContent(
      "Request Issuance of Credits",
    );

    expect(screen.getByTestId("action-link")).toHaveAttribute(
      "href",
      "/compliance-summaries/123/request-issuance/review-compliance-summary",
    );
  });

  it("should display 'View Details' when neither obligation_id nor earned credits status is present", () => {
    const mockParams = createMockParams(123);

    render(ActionCell(mockParams));

    expect(screen.getByTestId("action-link")).toHaveTextContent("View Details");

    expect(screen.getByTestId("action-link")).toHaveAttribute(
      "href",
      "/compliance-summaries/123",
    );
  });

  it("should prioritize obligation_id over compliance_status when both are present", () => {
    const mockParams = createMockParams(123, 456, "Earned credits");

    render(ActionCell(mockParams));

    expect(screen.getByTestId("action-link")).toHaveTextContent(
      "Manage Obligation",
    );

    expect(screen.getByTestId("action-link")).toHaveAttribute(
      "href",
      "/compliance-summaries/123/manage-obligation/review-compliance-summary",
    );
  });
});
