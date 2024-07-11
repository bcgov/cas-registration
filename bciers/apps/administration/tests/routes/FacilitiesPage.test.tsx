import { render, screen } from "@testing-library/react";
import FacilitiesPage from "apps/administration/app/components/routes/facilities/Page";

// mocking the child component until this issue is fixed: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612
vi.mock("apps/administration/app/components/facilities/Facilities", () => {
  return {
    default: () => <div>mocked child component</div>,
  };
});

describe("Facilities page", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("displays `Add Facility` button for external users", async () => {
    render(
      await FacilitiesPage({
        operationId: "random UUID",
        searchParams: {},
        isExternalUser: true,
      }),
    );
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Facility" })).toBeVisible();
  });
  it("Not displaying `Add Facility` button for internal users", async () => {
    render(
      await FacilitiesPage({
        operationId: "random UUID",
        searchParams: {},
        isExternalUser: false,
      }),
    );
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Add Facility" }),
    ).not.toBeInTheDocument();
  });
});
