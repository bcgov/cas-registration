import { render, screen } from "@testing-library/react";
import { useSession, useRouter } from "@bciers/testConfig/mocks";
import { getContact, getUserOperatorUsers } from "./mocks";
import ContactPage from "apps/administration/app/components/contacts/ContactPage";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

const contactId = "025328a0-f9e8-4e1a-888d-aa192cb053db";
const contactFormData = {
  id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone_number: "+16044011234",
  position_title: "Senior Officer",
  street_address: "123 Main St",
  municipality: "Cityville",
  province: "ON",
  postal_code: "A1B 2C3",
};

describe("Contact component", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useSession.mockReturnValue({
      get: vi.fn(),
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    });
  });

  it("renders the appropriate error component when getContact fails", async () => {
    getContact.mockReturnValueOnce({
      error: "Do not attempt to contact this contact",
    });
    await expect(async () => {
      render(
        await ContactPage({
          contactId,
        }),
      );
    }).rejects.toThrow("Failed to retrieve contact information");
  });

  it("renders the appropriate error component when getUserOperatorUsers fails", async () => {
    getUserOperatorUsers.mockReturnValueOnce({
      error: "No users found",
    });
    await expect(async () => {
      render(
        await ContactPage({
          contactId: undefined,
        }),
      );
    }).rejects.toThrow("Failed to retrieve user information");
  });
  it("renders the Contact component in create mode", async () => {
    getUserOperatorUsers.mockReturnValueOnce([]);
    render(
      await ContactPage({
        contactId: undefined,
      }),
    );
    expect(screen.getByText("Add Contact")).toBeVisible();
    // Note component
    expect(
      screen.getByText(
        "Once added, this new contact can be selected wherever needed or applicable.",
      ),
    ).toBeVisible();
  });
  it("renders the Contact component in readonly mode(Contact details)", async () => {
    getContact.mockReturnValueOnce(contactFormData);
    getUserOperatorUsers.mockReturnValueOnce([]);
    render(
      await ContactPage({
        contactId,
      }),
    );
    expect(screen.getByText("Contact Details")).toBeVisible();
    // Note component
    expect(
      screen.getByText("View or update information of this contact here."),
    ).toBeVisible();
  });
});
