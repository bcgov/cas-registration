import "@testing-library/jest-dom";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import ContactsDataGrid from "apps/administration/app/components/contacts/ContactsDataGrid";
import { useSearchParams } from "@bciers/testConfig/mocks";
import { QueryParams } from "@bciers/testConfig/types";
import extractParams from "@bciers/testConfig/helpers/extractParams";

const mockReplace = vi.spyOn(global.history, "replaceState");

const mockGetSearchParams = vi.fn();
useSearchParams.mockReturnValue({
  get: mockGetSearchParams,
} as QueryParams);

const mockExternalResponse = {
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

const mockInternalResponse = {
  rows: [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      operator__legal_name: "Legal name Doe",
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      operator__legal_name: "Legal name Smith",
    },
  ],
  row_count: 2,
};

describe("ContactsDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the ContactsDataGrid grid for external users", async () => {
    render(
      <ContactsDataGrid
        isExternalUser={true}
        initialData={mockExternalResponse}
      />,
    );

    // correct headers
    expect(
      screen.queryByRole("columnheader", { name: "First Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Last Name" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Business Email Address" }),
    ).toBeVisible();
    // Internal users should only see two below columns
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    // Check data displays
    expect(screen.getByText("john.doe@example.com")).toBeVisible();
    expect(screen.getByText("jane.smith@example.com")).toBeVisible();
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
    );
  });

  it("renders the ContactsDataGrid grid for internal users", async () => {
    render(
      <ContactsDataGrid
        isExternalUser={false}
        initialData={mockInternalResponse}
      />,
    );

    // correct headers
    expect(
      screen.queryByRole("columnheader", { name: "First Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Last Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Business Email Address" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Actions" }),
    ).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(4);

    // Check data displays
    expect(screen.getByText("john.doe@example.com")).toBeVisible();

    expect(screen.getByText("Legal name Doe")).toBeVisible();
    expect(screen.getByText("jane.smith@example.com")).toBeVisible();
    expect(screen.getByText("Legal name Smith")).toBeVisible();
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
    );
    expect(
      screen.getAllByRole("link", { name: /View Details/i })[0],
    ).toHaveAttribute("href", "/contacts/1?contacts_title=John Doe");
  });

  it("makes API call with correct params when sorting", async () => {
    render(
      <ContactsDataGrid
        isExternalUser={true}
        initialData={mockExternalResponse}
      />,
    );

    // click on the first column header
    const firstNameHeader = screen.getByRole("columnheader", {
      name: "First Name",
    });
    act(() => {
      firstNameHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[0][2]), "sort_field"),
    ).toBe("first_name");
    expect(
      extractParams(String(mockReplace.mock.calls[0][2]), "sort_order"),
    ).toBe("asc");

    // click on the same column header again
    act(() => {
      firstNameHeader.click();
    });
    expect(
      extractParams(String(mockReplace.mock.calls[1][2]), "sort_field"),
    ).toBe("first_name");
    expect(
      extractParams(String(mockReplace.mock.calls[1][2]), "sort_order"),
    ).toBe("desc");

    // click on the second column header
    const lastNameHeader = screen.getByRole("columnheader", {
      name: "Last Name",
    });
    act(() => {
      lastNameHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[2][2]), "sort_field"),
    ).toBe("last_name");
    expect(
      extractParams(String(mockReplace.mock.calls[2][2]), "sort_order"),
    ).toBe("asc");

    // click on the same column header again
    act(() => {
      lastNameHeader.click();
    });

    expect(
      extractParams(String(mockReplace.mock.calls[3][2]), "sort_field"),
    ).toBe("last_name");
    expect(
      extractParams(String(mockReplace.mock.calls[3][2]), "sort_order"),
    ).toBe("desc");
  });

  it("makes API call with correct params when filtering", async () => {
    render(
      <ContactsDataGrid
        isExternalUser={true}
        initialData={mockInternalResponse}
      />,
    );

    const searchInput = screen.getAllByPlaceholderText(/Search/i)[0]; // first name search input
    expect(searchInput).toBeVisible();
    searchInput.focus();
    act(() => {
      fireEvent.change(searchInput, { target: { value: "john" } });
    });
    expect(searchInput).toHaveValue("john");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });

    await waitFor(() => {
      // check that the API call was made with the correct params
      expect(extractParams(String(mockReplace.mock.calls), "first_name")).toBe(
        "john",
      );
    });
  });
  it("shows the snackbar when being redirected from a contact deletion", async () => {
    mockGetSearchParams.mockReturnValue({ from_deletion: true });
    render(
      <ContactsDataGrid
        isExternalUser={true}
        initialData={mockInternalResponse}
      />,
    );
    expect(screen.getByText("Contact deleted")).toBeVisible();
  });
  it("does not show the snackbar if not redirected from a contact deletion", async () => {
    mockGetSearchParams.mockReturnValue(undefined);
    render(
      <ContactsDataGrid
        isExternalUser={true}
        initialData={mockInternalResponse}
      />,
    );
    expect(screen.queryByText("Contact deleted")).not.toBeInTheDocument();
  });
});
