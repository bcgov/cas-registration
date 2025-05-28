// import { render, screen } from "@testing-library/react";
// import { GridRenderCellParams } from "@mui/x-data-grid";
// import ActionCell from "@/compliance/src/app/components/compliance-summaries/cells/ActionCell";

describe.skip("ActionCell", () => {
  // const createMockParams = (
  //   id = 123,
  //   obligation_id?: number,
  //   status?: string,
  // ): GridRenderCellParams =>
  //   ({
  //     row: { id, obligation_id, status },
  //   }) as GridRenderCellParams;
  //
  // const expectLink = (name: string, href: string) => {
  //   const link = screen.getByRole("link", { name });
  //   expect(link).toBeVisible();
  //   expect(link).toHaveAttribute("href", href);
  // };
  //
  // it("displays 'Manage Obligation' when obligation_id is present", () => {
  //   render(ActionCell(createMockParams(123, 456)));
  //   expectLink(
  //     "Manage Obligation",
  //     "/compliance-summaries/123/review-compliance-summary",
  //   );
  // });
  //
  // it("displays 'Request Issuance of Credits' when status is 'Earned credits'", () => {
  //   render(ActionCell(createMockParams(123, undefined, "Earned credits")));
  //   expectLink(
  //     "Request Issuance of Credits",
  //     "/compliance-summaries/123/request-issuance/review-compliance-summary",
  //   );
  // });
  //
  // it("displays 'View Details' when neither obligation_id nor earned credits status is present", () => {
  //   render(ActionCell(createMockParams(123)));
  //   expectLink("View Details", "/compliance-summaries/123");
  // });
  //
  // it("prioritizes 'Manage Obligation' when both obligation_id and earned credits are present", () => {
  //   render(ActionCell(createMockParams(123, 456, "Earned credits")));
  //   expectLink(
  //     "Manage Obligation",
  //     "/compliance-summaries/123/review-compliance-summary",
  //   );
  // });
});
