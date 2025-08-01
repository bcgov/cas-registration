import { render, screen, act, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  actionHandler,
  archiveContact,
  useRouter,
  useSessionRole,
  useSearchParams,
  useParams,
} from "@bciers/testConfig/mocks";
import {
  contactsSchema,
  contactsUiSchema,
} from "apps/administration/app/data/jsonSchema/contact";
import ContactForm from "apps/administration/app/components/contacts/ContactForm";
import { createContactSchema } from "apps/administration/app/components/contacts/createContactSchema";
import { FrontendMessages } from "@bciers/utils/src/enums";

const mockReplace = vi.fn();
const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  replace: mockReplace,
  push: mockRouterPush,
});
useSearchParams.mockReturnValue({ from_deletion: true });
useParams.mockReturnValue({
  contactId: "123",
});

const contactFormData = {
  id: 123,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone_number: "+16044011234",
  position_title: "Senior Officer",
  street_address: "123 Main St",
  municipality: "Cityville",
  province: "ON",
  postal_code: "A1B 2C3",
  places_assigned: [
    {
      role_name: "Operation Representative",
      operation_name: "Operation 1",
      operation_id: "c0743c09-82fa-4186-91aa-4b5412e3415c",
    },
  ],
};

export const checkEmptyContactForm = () => {
  expect(
    screen.getByRole("heading", { name: /Personal Information/i }),
  ).toBeVisible();
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
};
export const fillContactForm = async () => {
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
  // province
  const provinceComboBoxInput = screen.getByRole("combobox", {
    name: /province/i,
  });
  const openProvinceDropdownButton = provinceComboBoxInput.parentElement
    ?.children[1]?.children[0] as HTMLInputElement;
  await userEvent.click(openProvinceDropdownButton);
  await userEvent.click(screen.getByText(/alberta/i));
  await userEvent.type(screen.getByLabelText(/Postal Code/i), "A1B 2C3");
};

const checkInlineMessage = (shouldExist = true) => {
  const message = screen.queryByText(
    /you can assign this representative to an operation directly in the operation information form\. to do so, go to the , select an operation, and go to the operation information form\./i,
  );

  if (shouldExist) {
    expect(message).toBeVisible();
    expect(
      screen.getByRole("link", { name: /operations page/i }),
    ).toBeInTheDocument();
  } else {
    expect(message).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /operations page/i }),
    ).not.toBeInTheDocument();
  }
};

describe("ContactForm component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user_admin");
  });

  it("renders the empty contact form when creating a new contact", async () => {
    render(
      <ContactForm
        schema={createContactSchema(contactsSchema, true)}
        uiSchema={contactsUiSchema}
        formData={{}}
        isCreating
      />,
    );
    // form fields and headings
    checkEmptyContactForm();

    checkInlineMessage();

    // Buttons
    expect(screen.getByRole("button", { name: /save/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /back/i })).toBeEnabled();
    expect(
      screen.queryByRole("button", { name: /delete contact/i }),
    ).not.toBeInTheDocument();
  });

  it("loads existing readonly contact form data for an external admin user", async () => {
    useSessionRole.mockReturnValue("industry_user_admin");
    const readOnlyContactSchema = createContactSchema(contactsSchema, false);
    const { container } = render(
      <ContactForm
        schema={readOnlyContactSchema}
        formData={contactFormData}
        isCreating={false}
      />,
    );

    expect(
      container.querySelector("#root_section1_first_name"),
    ).toHaveTextContent("John");

    expect(
      container.querySelector("#root_section1_last_name"),
    ).toHaveTextContent("Doe");

    expect(screen.getByText(/Places Assigned/i)).toBeVisible();
    expect(screen.getByText(/Operation Representative/i)).toBeVisible();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/operations/c0743c09-82fa-4186-91aa-4b5412e3415c?operations_title=Operation 1&from_contacts=true",
    );

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
    expect(
      screen.queryByRole("button", { name: /delete contact/i }),
    ).toBeVisible();
  });
  it("renders the form for an internal user", async () => {
    useSessionRole.mockReturnValue("cas_admin");
    const readOnlyContactSchema = createContactSchema(contactsSchema, false);
    render(
      <ContactForm
        schema={readOnlyContactSchema}
        formData={contactFormData}
        isCreating={false}
        allowEdit={false}
      />,
    );

    checkInlineMessage(false);

    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete contact/i }),
    ).not.toBeInTheDocument();
  });

  it("does not allow new contact form submission if there are validation errors (empty form data)", async () => {
    render(
      <ContactForm
        schema={createContactSchema(contactsSchema, true)}
        formData={{}}
        isCreating
      />,
    );
    const saveButton = screen.getByRole("button", { name: /save/i });
    act(() => {
      saveButton.click();
    });
    expect(screen.getAllByText(/^.* is required/i)).toHaveLength(9);
  });

  it(
    "fills the mandatory form fields, creates new contact, and redirects on success",
    {
      timeout: 10000,
    },
    async () => {
      render(
        <ContactForm
          schema={createContactSchema(contactsSchema, true)}
          formData={{}}
          isCreating
        />,
      );

      const response = {
        id: 123,
        first_name: "John",
        last_name: "Doe",
        error: null,
      };
      actionHandler.mockReturnValueOnce(response);

      await fillContactForm();
      // Submit
      await userEvent.click(screen.getByRole("button", { name: /save/i }));

      await waitFor(() => {
        expect(actionHandler).toHaveBeenNthCalledWith(
          1,
          "registration/contacts",
          "POST",
          "/contacts",
          {
            body: JSON.stringify({
              first_name: "John",
              last_name: "Doe",
              position_title: "Senior Officer",
              email: "john.doe@example.com",
              phone_number: "+1 1 604 401 1234",
              street_address: "123 Main St",
              municipality: "Cityville",
              province: "AB",
              postal_code: "A1B2C3",
            }),
          },
        );
        expect(mockReplace).toHaveBeenCalledWith(
          "/contacts/123?contacts_title=John Doe",
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText(FrontendMessages.SUBMIT_CONFIRMATION),
        ).toBeVisible();
      });
    },
  );
  it(
    "creates a new contact, edits it, and submits the updated contact",
    {
      timeout: 10000,
    },
    async () => {
      render(
        <ContactForm
          schema={createContactSchema(contactsSchema, true)}
          formData={{}}
          isCreating
        />,
      );

      let response = {
        id: 123,
        first_name: "John",
        last_name: "Doe",
        error: null,
      };
      actionHandler.mockReturnValueOnce(response);

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

      await userEvent.type(
        screen.getByLabelText(/Business Mailing Address+/i),
        "123 Street",
      );
      await userEvent.type(screen.getByLabelText(/Municipality+/i), "Toronto");

      const provinceDropdown = screen.getByLabelText(/Province+/i);
      await userEvent.click(provinceDropdown);
      await userEvent.click(screen.getByText(/ontario/i));

      await userEvent.type(screen.getByLabelText(/Postal Code+/i), "H0H 0H0");

      // Submit
      await userEvent.click(screen.getByRole("button", { name: /save/i }));

      // assert first invocation: POST
      expect(actionHandler).toHaveBeenNthCalledWith(
        1,
        "registration/contacts",
        "POST",
        "/contacts",
        {
          body: JSON.stringify({
            first_name: "John",
            last_name: "Doe",
            position_title: "Senior Officer",
            email: "john.doe@example.com",
            phone_number: "+1 1 604 401 1234",
            street_address: "123 Street",
            municipality: "Toronto",
            province: "ON",
            postal_code: "H0H0H0",
          }),
        },
      );

      // switch to edit mode
      await userEvent.click(screen.getByRole("button", { name: /edit/i }));

      // update Personal Information
      const firstNameField = screen.getByLabelText(/First Name/i);
      await userEvent.clear(firstNameField);
      await userEvent.type(firstNameField, "John updated");
      const lastNameField = screen.getByLabelText(/Last Name/i);
      await userEvent.clear(lastNameField);
      await userEvent.type(lastNameField, "Doe updated");

      response = {
        id: 123,
        first_name: "John updated",
        last_name: "Doe updated",
        error: null,
      };
      actionHandler.mockReturnValueOnce(response);

      // Submit
      await userEvent.click(screen.getByRole("button", { name: /save/i }));

      // assert second invocation: PUT
      expect(actionHandler).toHaveBeenNthCalledWith(
        2,
        "registration/contacts/123",
        "PUT",
        "/contacts/123",
        {
          body: JSON.stringify({
            first_name: "John updated",
            last_name: "Doe updated",
            position_title: "Senior Officer",
            email: "john.doe@example.com",
            phone_number: "+1 1 604 401 1234",
            street_address: "123 Street",
            municipality: "Toronto",
            province: "ON",
            postal_code: "H0H0H0",
          }),
        },
      );
    },
  );
  it("updates existing contact form data and hits the correct endpoint", async () => {
    const readOnlyContactSchema = createContactSchema(contactsSchema, false);
    render(
      <ContactForm
        schema={readOnlyContactSchema}
        formData={contactFormData}
        allowEdit
      />,
    );
    // switch to edit mode
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    // update Personal Information
    const firstNameField = screen.getByLabelText(/First Name/i);
    await userEvent.clear(firstNameField);
    await userEvent.type(firstNameField, "John updated");
    const lastNameField = screen.getByLabelText(/Last Name/i);
    await userEvent.clear(lastNameField);
    await userEvent.type(lastNameField, "Doe updated");

    const response = {
      id: 123,
      first_name: "John updated",
      last_name: "Doe updated",
      error: null,
    };
    actionHandler.mockReturnValueOnce(response);

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /save/i }));

    expect(actionHandler).toHaveBeenNthCalledWith(
      1,
      "registration/contacts/123",
      "PUT",
      "/contacts/123",
      {
        body: JSON.stringify({
          first_name: "John updated",
          last_name: "Doe updated",
          places_assigned: [
            {
              role_name: "Operation Representative",
              operation_name: "Operation 1",
              operation_id: "c0743c09-82fa-4186-91aa-4b5412e3415c",
            },
          ],
          position_title: "Senior Officer",
          email: "john.doe@example.com",
          phone_number: "+16044011234",
          street_address: "123 Main St",
          municipality: "Cityville",
          province: "ON",
          postal_code: "A1B 2C3",
        }),
      },
    );
  });
  it("renders the places assigned field in read-only mode when editing", async () => {
    const readOnlyContactSchema = createContactSchema(contactsSchema, false);
    render(
      <ContactForm
        schema={readOnlyContactSchema}
        formData={contactFormData}
        allowEdit
      />,
    );
    // switch to edit mode
    await userEvent.click(screen.getByRole("button", { name: /edit/i }));

    // regression test: places assigned field should not be editable
    expect(
      screen.queryByDisplayValue(/operation representative \- operation 1/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove item/i }),
    ).not.toBeInTheDocument();
  });
  it("does not allow deletion of contact if the contact is asssigned to places", async () => {
    const readOnlyContactSchema = createContactSchema(contactsSchema, false);
    render(
      <ContactForm
        schema={readOnlyContactSchema}
        formData={contactFormData}
        allowEdit
      />,
    );
    const deleteButton = screen.getByRole("button", {
      name: /delete contact/i,
    });
    expect(deleteButton).toBeVisible(); //  delete button on the contact form
    await userEvent.click(deleteButton);
    await waitFor(() => {
      expect(
        screen.getByText(
          /Before you can delete this contact, please remove them from the places they are assigned. If you are the only one assigned, you must replace them with another contact in the assigned place./i,
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("button", { name: /back/i })).toBeVisible();
  });

  it("allows deletion of contact if they are not assigned anywhere", async () => {
    const readOnlyContactSchema = createContactSchema(contactsSchema, false);
    render(
      <ContactForm
        schema={readOnlyContactSchema}
        formData={{ ...contactFormData, places_assigned: [] }}
        allowEdit
      />,
    );
    const deleteButton = screen.getByRole("button", {
      name: /delete contact/i,
    });
    expect(deleteButton).toBeVisible(); //  delete button on the contact form
    await userEvent.click(deleteButton);
    const modal = screen.getByRole("dialog");
    expect(modal).toBeVisible();

    expect(
      within(modal).getByText(
        /Please confirm that you would like to delete this contact./i,
      ),
    ).toBeVisible();

    expect(
      within(modal).getByRole("button", { name: /cancel/i }),
    ).toBeVisible();

    const modalDeleteButton = within(modal).getByRole("button", {
      name: /delete contact/i,
    });
    expect(modalDeleteButton).toBeVisible();

    await userEvent.click(modalDeleteButton);
    expect(archiveContact).toHaveBeenCalledWith("123");
  });

  it("does not allow deletion if industry user is a reporter", async () => {
    vi.clearAllMocks();
    useSessionRole.mockReturnValue("industry_user");
    const deleteButton = screen.queryByRole("button", {
      name: /delete contact/i,
    });
    expect(deleteButton).not.toBeInTheDocument();
  });
});
