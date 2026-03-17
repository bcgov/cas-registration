import { render, screen } from "@testing-library/react";
import {
  getSessionRole,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import FacilitiesHeader from "apps/administration/app/components/facilities/FacilitiesHeader";
import { OperationTypes } from "@bciers/utils/src/enums";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("FacilitiesHeader component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the note message", async () => {
    getSessionRole.mockReturnValue("industry_user");

    render(
      await FacilitiesHeader({
        operationId: "8be4c7aa-6ab3-4aad-9206-0ef914fea063",
        searchParams: { operations_title: "Operation 2" },
        operation: { type: OperationTypes.LFO },
      }),
    );

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the facilities of this operation here.",
    );
  });

  it('renders the "Add Facility" button/link for external users when operation type is not SFO', async () => {
    getSessionRole.mockReturnValue("industry_user");

    render(
      await FacilitiesHeader({
        operationId: "random UUID",
        searchParams: { operations_title: "Operation 2" },
        operation: { type: OperationTypes.LFO }, // non-SFO
      }),
    );

    expect(screen.getByRole("button", { name: "Add Facility" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Facility" })).toHaveAttribute(
      "href",
      "/operations/random UUID/facilities/add-facility?operations_title=Operation 2",
    );
  });

  it('does not render the "Add Facility" button/link for internal users', async () => {
    getSessionRole.mockReturnValue("cas_director");

    render(
      await FacilitiesHeader({
        operationId: "random UUID",
        searchParams: { operations_title: "Operation 2" },
        operation: { type: OperationTypes.LFO },
      }),
    );

    expect(
      screen.queryByRole("button", { name: "Add Facility" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Add Facility" }),
    ).not.toBeInTheDocument();
  });

  it('does not render the "Add Facility" button/link for external users with an SFO operation', async () => {
    getSessionRole.mockReturnValue("industry_user");

    render(
      await FacilitiesHeader({
        operationId: "random UUID",
        searchParams: { operations_title: "Operation 2" },
        operation: { type: OperationTypes.SFO },
      }),
    );

    expect(
      screen.queryByRole("button", { name: "Add Facility" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Add Facility" }),
    ).not.toBeInTheDocument();
  });
});
