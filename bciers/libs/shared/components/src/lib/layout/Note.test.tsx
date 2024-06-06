import { render, screen, waitFor } from "@testing-library/react";

import Note from "./Note";

describe("The note component", () => {
  it("should render successfully", () => {
    render(
      <Note>
        <b>Note:</b> Test note component
      </Note>,
    );

    expect(screen.getByText(/Test note component/)).toBeVisible();
  });

  it("should have the correct styles for the info variant", () => {
    render(<Note>Test note component</Note>);

    const note = screen.getByText("Test note component");

    expect(note).toHaveClass("bg-bc-bg-grey");
  });

  it("should have the correct styles for the important variant", () => {
    render(<Note variant="important">Test note component</Note>);

    const note = screen.getByText("Test note component");

    expect(note).toHaveClass("bg-bc-yellow");
  });

  it("should have the correct styles for the info variant when no variant is provided", () => {
    render(<Note>Test note component</Note>);

    const note = screen.getByText("Test note component");

    expect(note).toHaveClass("bg-bc-bg-grey");
  });
});
