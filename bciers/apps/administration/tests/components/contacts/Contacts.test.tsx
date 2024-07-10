import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import { fetchContactsPageData } from "./mocks";
import Contacts from "@/administration/app/components/contacts/Contacts";

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

describe("Contacts component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders a message when there are no contacts in the database", async () => {
    fetchContactsPageData.mockResolvedValueOnce(undefined);
    render(
      await Contacts({
        searchParams: {},
      }),
    );
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByText(/No contacts data in database./i)).toBeVisible();
  });

  it("renders the ContactDataGrid component when there are contacts in the database", async () => {
    fetchContactsPageData.mockResolvedValueOnce(mockResponse);
    render(
      await Contacts({
        searchParams: {},
      }),
    );
    expect(screen.getByRole("grid")).toBeVisible();
    expect(
      screen.queryByText(/No operations data in database./i),
    ).not.toBeInTheDocument();
  });

  it("renders the correct note message and displays `Add Contact` button for external users", async () => {
    fetchContactsPageData.mockResolvedValueOnce(mockResponse);
    render(await Contacts({ searchParams: {}, isExternalUser: true }));
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes. Please keep the information up to date here.",
    );
    expect(screen.getByRole("button", { name: "Add Contact" })).toBeVisible();
  });

  it("renders the correct note message for internal users", async () => {
    fetchContactsPageData.mockResolvedValueOnce(mockResponse);
    render(await Contacts({ searchParams: {}, isExternalUser: false }));
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View all the contacts, which can be sorted or filtered by operator here.",
    );
    expect(
      screen.queryByRole("button", { name: "Add Contact" }),
    ).not.toBeInTheDocument();
  });
});
