import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import {
  contactsSchema,
  contactsUiSchema,
} from "../../../app/data/jsonSchema/contact";
import ContactsForm from "apps/administration/app/components/contacts/ContactsForm";
import { createContactSchema } from "apps/administration/app/components/contacts/createContactSchema";

const mockReplace = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
});

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

describe("ContactsForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("renders the empty contact form when creating a new contact", async () => {
    render(
      <ContactsForm
        schema={contactsSchema}
        uiSchema={contactsUiSchema}
        formData={{}}
        isCreating
      />,
    );
    // form fields and headings
    expect(
      screen.getByRole("heading", { name: /Personal Information/i }),
    ).toBeVisible();
    expect(
      screen.getByLabelText(/Is this contact a user in BCIERS/i),
    ).toBeChecked();
    expect(screen.getByLabelText(/Select the user/i)).toHaveValue("");
    expect(screen.getByLabelText(/First Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("");

    expect(
      screen.getByRole("heading", { name: /Work Information/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Job Title \/ Position/i)).toHaveValue("");

    expect(
      screen.getByRole("heading", { name: /Contact Information/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Business Email Address/i)).toHaveValue("");
    expect(screen.getByLabelText(/Business Telephone Number/i)).toHaveValue("");

    expect(
      screen.getByRole("heading", { name: /Address Information/i }),
    ).toBeVisible();
    expect(screen.getByLabelText(/Business Mailing Address/i)).toHaveValue("");
    expect(screen.getByLabelText(/Municipality/i)).toHaveValue("");
    expect(screen.getByLabelText(/Province/i)).toHaveValue("");
    expect(screen.getByLabelText(/Postal Code/i)).toHaveValue("");

    // Inline message
    expect(
      screen.getByText(
        /To assign this representative to an operation, go to the operation information form/i,
      ),
    ).toBeVisible();

    // Buttons
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeEnabled();
  });
  it("loads existing readonly contact form data", async () => {
    const readOnlyContactSchema = createContactSchema([], false);
    const { container } = render(
      <ContactsForm
        schema={readOnlyContactSchema}
        uiSchema={contactsUiSchema}
        formData={contactFormData}
        isCreating={false}
      />,
    );
    // form fields
    expect(
      screen.queryByText(/Is this contact a user in BCIERS/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Select the user/i)).not.toBeInTheDocument();

    expect(
      container.querySelector("#root_section1_first_name"),
    ).toHaveTextContent("John");

    expect(
      container.querySelector("#root_section1_last_name"),
    ).toHaveTextContent("Doe");

    expect(
      container.querySelector("#root_section2_position_title"),
    ).toHaveTextContent("Senior Officer");

    expect(container.querySelector("#root_section3_email")).toHaveTextContent(
      "john.doe@example.com",
    );

    expect(
      container.querySelector("#root_section3_phone_number"),
    ).toHaveTextContent("+16044011234");

    expect(
      container.querySelector("#root_section4_street_address"),
    ).toHaveTextContent("123 Main St");

    expect(
      container.querySelector("#root_section4_municipality"),
    ).toHaveTextContent("Cityville");

    expect(
      container.querySelector("#root_section4_province"),
    ).toHaveTextContent("Ontario");

    expect(
      container.querySelector("#root_section4_postal_code"),
    ).toHaveTextContent("A1B 2C3");

    expect(screen.getByRole("button", { name: /edit/i })).toBeEnabled();
  });
  it("does not allow new contact form submission if there are validation errors (empty form data)", async () => {
    render(
      <ContactsForm
        schema={contactsSchema}
        uiSchema={contactsUiSchema}
        formData={{}}
        isCreating
      />,
    );
    const submitButton = screen.getByRole("button", { name: /submit/i });
    act(() => {
      submitButton.click();
    });
    expect(screen.getAllByText(/Required field/i)).toHaveLength(6); // 5 required fields + 1 for the user combobox
  });
  it(
    "fills the mandatory form fields, creates new contact, and redirects on success",
    {
      timeout: 10000,
    },
    async () => {
      render(
        <ContactsForm
          schema={contactsSchema}
          uiSchema={contactsUiSchema}
          formData={{}}
          isCreating
        />,
      );

      const response = {
        id: "4abd8367-efd1-4654-a7ea-fa1a015d3cae",
        first_name: "John",
        last_name: "Doe",
        error: null,
      };
      actionHandler.mockReturnValueOnce(response);

      // Switch off the user combobox(so it doesn't raise form error)
      await userEvent.click(
        screen.getByLabelText(/Is this contact a user in BCIERS/i),
      );

      // Personal Information
      await userEvent.type(screen.getByLabelText(/First Name/i), "John");
      await userEvent.type(screen.getByLabelText(/Last Name/i), "Doe");
      // Work Information
      await userEvent.type(
        screen.getByLabelText(/Job Title \/ Position/i),
        "Senior Officer",
      );
      // Contact Information
      await userEvent.type(
        screen.getByLabelText(/Business Email Address/i),
        "john.doe@example.com",
      );
      await userEvent.type(
        screen.getByLabelText(/Business Telephone Number/i),
        "+16044011234",
      );
      // Address Information
      await userEvent.type(
        screen.getByLabelText(/Business Mailing Address/i),
        "123 Main St",
      );
      await userEvent.type(screen.getByLabelText(/Municipality/i), "Cityville");
      await userEvent.type(screen.getByLabelText(/Province/i), "ON");
      await userEvent.type(screen.getByLabelText(/Postal Code/i), "A1B 2C3");
      // Submit
      await userEvent.click(screen.getByRole("button", { name: /submit/i }));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(`/contacts/${response.id}`);
      });
    },
  );
});
