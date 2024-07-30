import { render, screen } from "@testing-library/react";
import FacilitiesPage from "apps/administration/app/components/facilities/FacilitiesPage";

const searchParams = { operationsTitle: "Operation 2" };
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
<<<<<<< HEAD:bciers/apps/administration/tests/routes/FacilitiesPage.test.tsx
        searchParams: {
          operations_title: "Operation Title",
        },
=======
        searchParams: searchParams,
>>>>>>> e0ef88ae (feat: facility form edit):bciers/apps/administration/tests/components/facilities/FacilitiesPage.test.tsx
        isExternalUser: true,
      }),
    );
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Facility" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Facility" })).toHaveAttribute(
      "href",
<<<<<<< HEAD:bciers/apps/administration/tests/routes/FacilitiesPage.test.tsx
      "/operations/random UUID/facilities/add-facility?operations_title=Operation Title",
=======
      `/operations/random UUID/facilities/add-facility?operationsTitle=${searchParams.operationsTitle}`,
>>>>>>> e0ef88ae (feat: facility form edit):bciers/apps/administration/tests/components/facilities/FacilitiesPage.test.tsx
    );
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
