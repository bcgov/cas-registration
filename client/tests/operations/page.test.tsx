import Operations from "@/app/components/routes/operations/Operations";
import Page from "@/app/operations/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";

describe("operations page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });
  xit("renders the Operations List page", async () => {
    render(await Page());
    // render(<Page />);
    // Check if the "Add Operation" button is present and has the correct text
    expect(
      screen.getByRole("button", {
        name: /add operation/i,
      }),
    ).toBeVisible();

    // Check if the data grid is present
    expect(screen.getByRole("grid")).toBeVisible();
    await expect(
      screen.getByRole("button", { name: /view details/i }),
    ).toHaveLength(2);
  });
});
