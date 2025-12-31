import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import {
  ExternalUserOperationsDataGridLayout,
  InternalUserOperationsDataGridLayout,
} from "apps/administration/app/components/operations/OperationsLayouts";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("OperationsLayouts component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the external operation data grid layout", async () => {
    render(
      ExternalUserOperationsDataGridLayout({
        children: <div>Im a little teapot</div>,
      }),
    );
    expect(
      screen.getByRole("link", { name: "Add and Register an Operation" }),
    ).toHaveAttribute("href", "../registration/register-an-operation");
    expect(
      screen.getByText(/View the operations owned by your operator here./i),
    ).toBeVisible();
    expect(screen.getByText(/Im a little teapot/i)).toBeVisible();
  });
  it("renders the internal operation data grid layout", async () => {
    render(
      InternalUserOperationsDataGridLayout({
        children: <div>Im a little moka pot</div>,
      }),
    );
    expect(
      screen.getByText(
        /View all the operations, which can be sorted or filtered by operator here./i,
      ),
    ).toBeVisible();
    expect(screen.getByText(/Im a little moka pot/i)).toBeVisible();
  });
  it("renders the missing representative alert when operationsWithoutContacts is provided", async () => {
    const operationsWithoutContacts = ["Operation 1", "Operation 2"];
    render(
      ExternalUserOperationsDataGridLayout({
        operationsWithoutContacts,
        children: <div>Im a little teapot</div>,
      }),
    );
    expect(
      screen.getByText(
        /Missing Information: Please add an operation representative for Operation 1, Operation 2 in their operation information page./i,
      ),
    ).toBeVisible();
  });
});
