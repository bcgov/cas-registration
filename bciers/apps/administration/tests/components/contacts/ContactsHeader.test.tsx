import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import ContactsHeader from "apps/administration/app/components/contacts/ContactsHeader";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("ContactsHeader component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the correct note message for external users", async () => {
    render(await ContactsHeader({ isExternalUser: true }));
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes. Please keep the information up to date here.",
    );
  });

  it("displays `Add Contact` button for external admin users", async () => {
    render(await ContactsHeader({ isExternalUser: true }));
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes. Please keep the information up to date here.",
    );
    expect(screen.getByRole("button", { name: "Add Contact" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Contact" })).toHaveAttribute(
      "href",
      "/contacts/add-contact",
    );
  });

  it("renders the correct note message for internal users", async () => {
    render(await ContactsHeader({ isExternalUser: false }));
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
