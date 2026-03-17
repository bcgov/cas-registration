import { render, screen } from "@testing-library/react";
import { auth, useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import ContactsPage from "apps/administration/app/components/contacts/ContactsPage";
import fetchContactsPageData from "apps/administration/app/components/contacts/fetchContactsPageData";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(async () => {
    const session = auth();
    return session?.user?.app_role ?? "";
  }),
}));

vi.mock(
  "apps/administration/app/components/contacts/fetchContactsPageData",
  () => ({
    default: vi.fn(),
  }),
);

vi.mock("apps/administration/app/components/contacts/ContactsDataGrid", () => ({
  default: ({
    isExternalUser,
    initialData,
  }: {
    isExternalUser: boolean;
    initialData: { row_count: number };
  }) => (
    <div data-testid="contacts-datagrid">
      isExternalUser:{String(isExternalUser)} row_count:{initialData.row_count}
    </div>
  ),
}));

const mockResponse = {
  rows: [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
    },
  ],
  row_count: 2,
};

describe("ContactsPage component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders a message when there are no contacts in the database", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "industry_user_admin" } });
    vi.mocked(fetchContactsPageData).mockResolvedValueOnce(undefined as any);

    render(await ContactsPage({ searchParams: {} }));

    expect(screen.getByText("No contacts data in database.")).toBeVisible();
    expect(screen.queryByTestId("contacts-datagrid")).not.toBeInTheDocument();
  });

  it("renders the ContactsDataGrid component when there are contacts in the database", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "industry_user_admin" } });
    vi.mocked(fetchContactsPageData).mockResolvedValueOnce(mockResponse as any);

    render(await ContactsPage({ searchParams: {} }));

    const grid = screen.getByTestId("contacts-datagrid");
    expect(grid).toBeVisible();
    expect(grid).toHaveTextContent("row_count:2");
    expect(grid).toHaveTextContent("isExternalUser:true");
    expect(
      screen.queryByText(/No contacts data in database\./i),
    ).not.toBeInTheDocument();
  });

  it("passes isExternalUser=false for internal users", async () => {
    auth.mockReturnValueOnce({ user: { app_role: "cas_admin" } }); // internal
    vi.mocked(fetchContactsPageData).mockResolvedValueOnce(mockResponse as any);

    render(await ContactsPage({ searchParams: {} }));

    expect(screen.getByTestId("contacts-datagrid")).toHaveTextContent(
      "isExternalUser:false",
    );
  });
});
