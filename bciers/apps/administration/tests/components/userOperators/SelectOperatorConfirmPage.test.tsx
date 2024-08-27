import { render, screen } from "@testing-library/react";
import { useSession, useRouter } from "@bciers/testConfig/mocks";
import { getContact, getUserOperatorUsers } from "../contacts/mocks";
import ContactPage from "apps/administration/app/components/userOperators/SelectOperatorConfirmPage";
useSession.mockReturnValue({
  get: vi.fn(),
});

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

const id = "025328a0-f9e8-4e1a-888d-aa192cb053db";
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

describe("Select Operator Confirm Page", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("renders the page correctly", async () => {
    getContact.mockReturnValueOnce(contactFormData);
    getUserOperatorUsers.mockReturnValueOnce([]);
    render(
      await ContactPage({
        id,
      }),
    );
    // Note component
    expect(
      screen.getByText("View or update information of this contact here."),
    ).toBeVisible();
  });
});
