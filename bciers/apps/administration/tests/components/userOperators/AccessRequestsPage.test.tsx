import { render, screen } from "@testing-library/react";
import AccessRequestsPage from "apps/administration/app/components/userOperators/AccessRequestsPage";

// mocking the child component until this issue is fixed: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612
vi.mock(
  "apps/administration/app/components/userOperators/AccessRequests",
  () => {
    return {
      default: () => <div>mocked child component</div>,
    };
  },
);

describe("Access Requests Page", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders Access Requests Page", () => {
    render(AccessRequestsPage());
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
