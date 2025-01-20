import { render, screen } from "@testing-library/react";
import ExternalTransferPage from "@/administration/app/components/transfers/ExternalTransferPage";

describe("ExternalTransferPage component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders the external transfers apge", async () => {
    render(await ExternalTransferPage());
    expect(
      screen.getByRole("heading", { name: /Report Transfers and Closures/i }),
    ).toBeVisible();
    // Note component
    expect(
      screen.getByRole("link", { name: "Report an Event" }),
    ).toHaveAttribute(
      "href",
      "https://submit.digital.gov.bc.ca/app/form/submit?f=d26fb011-2846-44ed-9f5c-26e2756a758f",
    );

    expect(
      screen.getByRole("link", { name: "GHGRegulator@gov.bc.ca" }),
    ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
  });
});
