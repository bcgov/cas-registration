import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import ContactDataGrid from "apps/registration/app/components/contacts/ContactDataGrid";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

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
  });
});
