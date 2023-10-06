import { render, screen } from "@testing-library/react";
import Page from "@/app/operations/page";

describe("operations page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the Operations List page", () => {
    render(<Page />);

    // Check if the "Add Operation" button is present and has the correct text
    expect(
      screen.getByRole("button", {
        name: /add operation/i,
      }),
    ).toBeVisible();

    // Check if the data grid is present
    expect(screen.getByRole("grid")).toBeVisible();
  });
});
