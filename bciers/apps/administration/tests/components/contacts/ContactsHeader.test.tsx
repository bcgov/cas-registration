import { render, screen } from "@testing-library/react";
import { auth, useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import ContactsHeader from "apps/administration/app/components/contacts/ContactsHeader";

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

describe("ContactsHeader component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the external contacts header and Add Contact link for industry users", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });

    render(await ContactsHeader());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes.",
    );

    expect(
      screen.getByRole("heading", { name: "Contacts" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Add Contact" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Add Contact" })).toHaveAttribute(
      "href",
      "/contacts/add-contact",
    );
  });

  it("renders the internal contacts header for CAS users and does not show Add Contact link", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_admin" },
    });

    render(await ContactsHeader());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(
      "View all the contacts, which can be sorted or filtered by operator here.",
    );

    expect(
      screen.getByRole("heading", { name: "Contacts" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Add Contact" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Add Contact" }),
    ).not.toBeInTheDocument();
  });
});
