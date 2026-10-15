import { render, screen } from "@testing-library/react";
import { SourceTypeBoxTemplate } from "./SourceTypeBoxTemplate";

describe("SourceTypeBoxTemplate", () => {
  it("renders the label as an h6 title in the BC blue", () => {
    render(<SourceTypeBoxTemplate label="Source type" />);

    const title = screen
      .getByText("Source type")
      .closest(".MuiTypography-root");
    expect(title).toHaveClass("MuiTypography-h6", "text-bc-bg-blue");
  });
});
