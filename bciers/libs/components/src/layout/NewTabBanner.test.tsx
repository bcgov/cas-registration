import { render, screen } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import NewTabBanner from "./NewTabBanner";

describe("NewTabBanner component", () => {
  it("does not render component when isNewTab is not true", () => {
    useSearchParams.mockReturnValue(new URLSearchParams("isNewTab=false"));

    render(<NewTabBanner />);

    expect(
      screen.queryByText("This link has opened in a new tab."),
    ).not.toBeInTheDocument();
  });

  it("does not render the banner component when isNewTab is missing", () => {
    useSearchParams.mockReturnValue(new URLSearchParams(""));

    render(<NewTabBanner />);

    expect(
      screen.queryByText("This link has opened in a new tab."),
    ).not.toBeInTheDocument();
  });

  it("renders the banner component when isNewTab=true", () => {
    useSearchParams.mockReturnValue(new URLSearchParams("isNewTab=true"));

    render(<NewTabBanner />);

    expect(
      screen.getByText(
        "This link has opened in a new tab. To go back to the report, close this tab. Then click sync latest changes.",
      ),
    ).toBeVisible();
  });

  it("renders the registration specific text when from_registration=true", () => {
    useSearchParams.mockReturnValue(
      new URLSearchParams("from_registration=true&isNewTab=true"),
    );

    render(<NewTabBanner />);

    expect(
      screen.queryByText(
        "This link has opened in a new tab. To go back to the report, close this tab. Then click sync latest changes.",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        "This link has opened in a new tab. If you make edits here, refresh the previous tab to see the updates. To go back, close this tab.",
      ),
    ).toBeVisible();
  });
});
