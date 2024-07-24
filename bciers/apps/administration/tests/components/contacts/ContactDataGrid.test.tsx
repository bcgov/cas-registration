import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import ContactDataGrid from "apps/administration/app/components/contacts/ContactDataGrid";
import { QueryParams } from "@bciers/testConfig/types";
import extractParams from "../helpers/extractParams";

const mockReplace = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
} as QueryParams);

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

describe("ContactDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the ContactDataGrid grid for external users", async () => {
    render(
      <ContactDataGrid isExternalUser={true} initialData={mockResponse} />,
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
      screen.queryByRole("columnheader", { name: "Operation Name" }),
    ).not.toBeInTheDocument();
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

  it("renders the ContactDataGrid grid for internal users", async () => {
    render(
      <ContactDataGrid isExternalUser={false} initialData={mockResponse} />,
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
      screen.queryByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).toBeVisible();
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
    expect(
      screen.getAllByRole("link", { name: /View Details/i })[0],
    ).toHaveAttribute("href", "contacts/1?contactsTitle=John Doe");
  });
  it("makes API call with correct params when sorting", async () => {
    render(
      <ContactDataGrid isExternalUser={true} initialData={mockResponse} />,
    );

    // click on the first column header
    const firstNameHeader = screen.getByRole("columnheader", {
      name: "First Name",
    });
    firstNameHeader.click();

    expect(extractParams(mockReplace.mock.calls[1], "sort_field")).toBe(
      "first_name",
    );
    expect(extractParams(mockReplace.mock.calls[1], "sort_order")).toBe("asc");

    // click on the same column header again
    firstNameHeader.click();
    expect(extractParams(mockReplace.mock.calls[2], "sort_field")).toBe(
      "first_name",
    );
    expect(extractParams(mockReplace.mock.calls[2], "sort_order")).toBe("desc");

    // click on the second column header
    const lastNameHeader = screen.getByRole("columnheader", {
      name: "Last Name",
    });
    lastNameHeader.click();
    expect(extractParams(mockReplace.mock.calls[3], "sort_field")).toBe(
      "last_name",
    );
    expect(extractParams(mockReplace.mock.calls[3], "sort_order")).toBe("asc");

    // click on the same column header again
    lastNameHeader.click();
    expect(extractParams(mockReplace.mock.calls[4], "sort_field")).toBe(
      "last_name",
    );
    expect(extractParams(mockReplace.mock.calls[4], "sort_order")).toBe("desc");
  });
  it("makes API call with correct params when filtering", async () => {
    render(
      <ContactDataGrid isExternalUser={true} initialData={mockResponse} />,
    );

    const searchInput = screen.getAllByPlaceholderText(/Search/i)[0]; // first name search input
    expect(searchInput).toBeVisible();
    searchInput.focus();
    act(() => {
      fireEvent.change(searchInput, { target: { value: "john" } });
    });
    expect(searchInput).toHaveValue("john");

    // check that the API call was made with the correct params
    expect(extractParams(mockReplace.mock.calls[1], "first_name")).toBe("john");
  });
});
