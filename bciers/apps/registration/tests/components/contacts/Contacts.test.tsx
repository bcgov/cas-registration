import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import { fetchContactsPageData } from "./mocks";
import Contacts from "apps/registration/app/components/contacts/Contacts";

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
});
