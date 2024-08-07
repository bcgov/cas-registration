import { render, screen } from "@testing-library/react";
import {
  fetchOperationsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import { ExternalUserOperationDataGridLayout } from "apps/administration/app/components/operations/OperationLayouts";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock(
  "apps/administration/app/components/operations/fetchOperationsPageData",
  () => ({
    default: fetchOperationsPageData,
  }),
);

describe("Operations component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the external operation data grid layout", async () => {
    render(
      await ExternalUserOperationDataGridLayout({
        children: <div>Im a little teapot</div>,
      }),
    );
    expect(
      screen.getByRole("link", { name: "Add and Register an Operation" }),
    ).toHaveAttribute("href", "../registration/register-an-operation");
    expect(screen.getByText(/I'm a little teapot/i)).toBeVisible();
  });
});
