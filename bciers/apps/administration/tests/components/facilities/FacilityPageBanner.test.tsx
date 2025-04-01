import { render, screen } from "@testing-library/react";
import FacilityPageBanner from "apps/administration/app/components/facilities/FacilityPageBanner";
import { useSearchParams } from "@bciers/testConfig/mocks";

describe("FacilityPageBanner component", () => {
  it("renders the banner component when from_registration=true", () => {
    useSearchParams.mockReturnValue(
      new URLSearchParams("from_registration=true"),
    );

    render(<FacilityPageBanner />);

    expect(
      screen.getByText(
        "This link opened in a new tab. If you make edits here, refresh the previous tab to see the updates. To go back, close this tab.",
      ),
    ).toBeVisible();
  });

  it("does not render the banner component when from_registration=false", () => {
    useSearchParams.mockReturnValue(
      new URLSearchParams("from_registration=false"),
    );

    render(<FacilityPageBanner />);

    expect(
      screen.queryByText("This link has opened in a new tab."),
    ).not.toBeInTheDocument();
  });

  it("does not render the banner component when from_registration is missing", () => {
    useSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<FacilityPageBanner />);

    expect(
      screen.queryByText("This link has opened in a new tab."),
    ).not.toBeInTheDocument();
  });
});
