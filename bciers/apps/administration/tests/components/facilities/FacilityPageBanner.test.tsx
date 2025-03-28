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
        "This link has opened in a new tab. To go back to the previous page, close this tab.",
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
