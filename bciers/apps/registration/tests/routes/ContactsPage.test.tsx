import { render, screen } from "@testing-library/react";
import ContactsPage from "apps/registration/app/components/routes/contacts/Page";

// mocking the child component until this issue is fixed: https://github.com/testing-library/react-testing-library/issues/1209#issuecomment-1673372612
vi.mock("apps/registration/app/components/contacts/Contacts", () => {
  return {
    default: () => <div>mocked child component</div>,
  };
});

describe("Contacts page", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the correct note message and displays `Add Contact` button for external users", async () => {
    render(await ContactsPage({ searchParams: {}, isExternalUser: true }));
    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes. Please keep the information up to date here.",
    );
    expect(screen.getByRole("button", { name: "Add Contact" })).toBeVisible();
  });
  it("renders the correct note message for internal users", async () => {
    render(await ContactsPage({ searchParams: {}, isExternalUser: false }));
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
