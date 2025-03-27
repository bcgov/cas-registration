import { render, screen } from "@testing-library/react";
import * as nextNavigation from "next/navigation";
import FacilityPageBanner from "apps/administration/app/components/facilities/FacilityPageBanner";

vi.mock("next/navigation", () => {
  const actual = vi.importActual<typeof nextNavigation>("next/navigation");
  return {
    ...actual,
    useSearchParams: vi.fn(),
  };
});

describe("FacilityPageBanner component", () => {
  it("renders the banner component when from_registration=true", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("from_registration=true"),
    );

    render(<FacilityPageBanner />);

    expect(
      screen.getByText(
        "This link has opened in a new tab. To go back to the previous page, close this tab.",
      ),
    ).toBeInTheDocument();
  });

  it("does not render the banner component when from_registration=false", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams("from_registration=false"),
    );

    render(<FacilityPageBanner />);

    expect(
      screen.queryByText("This link has opened in a new tab."),
    ).not.toBeInTheDocument();
  });

  it("does not render the banner component when from_registration is missing", () => {
    vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
      new URLSearchParams(""),
    );

    render(<FacilityPageBanner />);

    expect(
      screen.queryByText("This link has opened in a new tab."),
    ).not.toBeInTheDocument();
  });
});
