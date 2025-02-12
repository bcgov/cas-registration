import { getOperation } from "@bciers/testConfig/mocks";
import { render, screen } from "@testing-library/react";
import FacilitiesPage from "apps/administration/app/components/facilities/FacilitiesPage";

const searchParams = { operations_title: "Operation 2" };
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
  it("renders the appropriate error component when getOperation fails", async () => {
    getOperation.mockReturnValueOnce({
      error: "We couldn't find your operation information.",
    });
    await expect(async () => {
      render(
        await FacilitiesPage({
          operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
          searchParams: searchParams,
          isExternalUser: true,
        }),
      );
    }).rejects.toThrow("We couldn't find your operation information.");
  });
  it("displays `Add Facility` button for external users", async () => {
    render(
      await FacilitiesPage({
        operationId: "random UUID",
        searchParams: searchParams,
        isExternalUser: true,
      }),
    );
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(screen.getByRole("button", { name: "Add Facility" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Facility" })).toHaveAttribute(
      "href",
      "/operations/random UUID/facilities/add-facility?operations_title=Operation 2",
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
  it("Not displaying `Add Facility` button for external users with an SFO operation", async () => {
    getOperation.mockReturnValueOnce({
      id: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
      type: "Single Facility Operation",
    });
    render(
      await FacilitiesPage({
        operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
        searchParams: {},
        isExternalUser: true,
      }),
    );
    expect(
      screen.queryByRole("button", { name: "Add Facility" }),
    ).not.toBeInTheDocument();
  });
});
