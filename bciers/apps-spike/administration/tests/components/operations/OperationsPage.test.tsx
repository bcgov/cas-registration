import { render, screen } from "@testing-library/react";
import {
  fetchOperationsPageData,
  useRouter,
  useSearchParams,
} from "@bciers/testConfig/mocks";
import OperationsPage from "@/administration/app/components/operations/OperationsPage";
import { getSessionRole } from "@bciers/testConfig/mocks";

vi.mock("@bciers/components/form/components/AlertNote", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-note">{children}</div>
  ),
}));

vi.mock(
  "@/administration/app/components/operations/OperationsDataGrid",
  () => ({
    default: () => <div data-testid="operations-datagrid" />,
  }),
);

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("OperationsPage component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useRouter.mockReturnValue({
      query: {},
      replace: vi.fn(),
    });

    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });

  it("throws an error when there's a problem fetching data", async () => {
    getSessionRole.mockReturnValue("cas_director");
    fetchOperationsPageData.mockReturnValueOnce(undefined);

    await expect(async () => {
      render(await OperationsPage({ searchParams: {} }));
    }).rejects.toThrow("Failed to retrieve operations");
  });

  it('renders the "Add and Register an Operation" link for external users', async () => {
    getSessionRole.mockReturnValue("industry_user");
    fetchOperationsPageData.mockReturnValueOnce({
      rows: [],
      row_count: 0,
    });

    render(await OperationsPage({ searchParams: {} }));

    const link = screen.getByRole("link", {
      name: /add and register an operation/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "../registration/register-an-operation",
    );
  });

  it("renders the missing representative alert for external users when operationsWithoutContacts", async () => {
    getSessionRole.mockReturnValue("industry_user"); // external
    fetchOperationsPageData.mockReturnValueOnce({
      rows: [
        {
          operation__status: "Registered",
          operation__contact_ids: null,
          operation__name: "Operation Alpha",
        },
      ],
      row_count: 1,
    });

    render(await OperationsPage({ searchParams: {} }));

    const alert = screen.getByTestId("alert-note");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      /Missing Information: Please add an operation representative for/i,
    );
    expect(alert).toHaveTextContent(/Operation Alpha/i);
  });

  it("does not render the missing representative alert for internal users when operationsWithoutContacts", async () => {
    getSessionRole.mockReturnValue("cas_director"); // internal
    fetchOperationsPageData.mockReturnValueOnce({
      rows: [
        {
          operation__status: "Registered",
          operation__contact_ids: null,
          operation__name: "Operation Alpha",
        },
      ],
      row_count: 1,
    });

    render(await OperationsPage({ searchParams: {} }));

    expect(screen.queryByTestId("alert-note")).not.toBeInTheDocument();
  });
});
