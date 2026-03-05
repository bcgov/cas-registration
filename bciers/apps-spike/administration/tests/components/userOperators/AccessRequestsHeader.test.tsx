import { render, screen } from "@testing-library/react";
import AccessRequestsHeader from "apps/administration/app/components/userOperators/AccessRequestsHeader";

describe("Access Requests Header", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders Access Requests Header", () => {
    render(AccessRequestsHeader());
    expect(screen.getByTestId("note")).toBeVisible();
    expect(
      screen.getByText(
        /view the users or access requests to your operator here\./i,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /users and access requests/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /administrator role access:/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        /^view and edit all modules, approve of access requests$/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /reporter role access:/i,
      }),
    ).toBeVisible();
    expect(screen.getByText(/^view and edit all modules$/i)).toBeVisible();
  });
});
