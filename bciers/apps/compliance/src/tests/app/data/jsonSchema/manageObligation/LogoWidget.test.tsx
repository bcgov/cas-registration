import { render, screen } from "@testing-library/react";
import { LogoWidget } from "@/compliance/src/app/data/jsonSchema/manageObligation/LogoWidget";

describe("LogoWidget", () => {
  it("renders the BC Clean BC logo", () => {
    render(<LogoWidget />);

    const logo = screen.getByAltText("BC Clean BC Logo");
    expect(logo).toBeVisible();
    expect(logo).toHaveAttribute("width", "234");
    expect(logo).toHaveAttribute("height", "50");
  });
});
