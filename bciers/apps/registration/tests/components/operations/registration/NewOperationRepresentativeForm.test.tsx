import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import { actionHandler, useSession } from "@bciers/testConfig/mocks";
import userEvent from "@testing-library/user-event";
import NewOperationRepresentativeForm from "@/registration/app/components/operations/registration/NewOperationRepresentativeForm";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const existingOperationRepresentativesMock = [
  {
    id: 3,
    full_name: "John Doe",
  },
];

const contactsMock = [
  {
    id: 1,
    first_name: "Henry",
    last_name: "Ives",
    email: "henry.ives@example.com",
  },
  {
    id: 2,
    first_name: "Samantha",
    last_name: "Garcia",
    email: "samantha.garcia@email.com",
  },
];

const operationId = "002d5a9e-32a6-4191-938c-2c02bfec592d";
export const checkEmptyOperationRepresentativeForm = () => {
  expect(
    screen.getByLabelText(/select existing contact \(optional\)/i),
  ).toHaveValue("");
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
  expect(
    screen.getByRole("button", {
      name: /save operation representative/i,
    }),
  ).toBeVisible();
};

export const fillOperationRepresentativeForm = async () => {
  // Personal Information
  await userEvent.type(screen.getByLabelText(/First Name/i), "Isaac");
  await userEvent.type(screen.getByLabelText(/Last Name/i), "Newton");
  // Work Information
  await userEvent.type(
    screen.getByLabelText(/Job Title \/ Position/i),
    "Scientist",
  );
  // Contact Information
  await userEvent.type(
    screen.getByLabelText(/Business Email Address/i),
    "isaac.newton@email.com",
  );
  await userEvent.type(
    screen.getByLabelText(/Business Telephone Number/i),
    "+16044014321",
  );
  // Address Information
  await userEvent.type(
    screen.getByLabelText(/Business Mailing Address/i),
    "123 Under the Apple Tree",
  );
  await userEvent.type(screen.getByLabelText(/Municipality/i), "Gravityville");
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

describe("the NewOperationRepresentativeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("render the NewOperationRepresentativeForm component WITH an existing operation representative", async () => {
    render(
      <NewOperationRepresentativeForm
        formData={{
          operation_representatives: [3],
        }}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        step={5}
        existingOperationRepresentatives={existingOperationRepresentativesMock}
        contacts={contactsMock}
      />,
    );

    expect(
      screen.getByText(
        /please select the operation representative\(s\) from your existing contacts, or fill out the form to add a new operation representative/i,
      ),
    ).toBeVisible();

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
    expect(screen.getByText(/operation representative\(s\):/i)).toBeVisible();
    expect(screen.getByText(/john doe/i)).toBeVisible();
    expect(screen.getByTestId("DeleteOutlineIcon")).toBeVisible();

    //This button should not be visible before clicking the add new operation representative button
    expect(
      screen.queryByRole("button", {
        name: /save operation representative/i,
      }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", {
        name: /add new operation representative/i,
      }),
    );
    checkEmptyOperationRepresentativeForm();
    await userEvent.click(
      screen.getByRole("combobox", {
        name: /select existing contact \(optional\)/i,
      }),
    );
    expect(
      screen.getByRole("option", {
        name: /samantha garcia/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("option", {
        name: /henry ives/i,
      }),
    ).toBeVisible();
  });

  it("render the NewOperationRepresentativeForm component and select an existing contact", async () => {
    render(
      <NewOperationRepresentativeForm
        formData={{
          operation_representatives: [3],
        }}
        operation={operationId}
        step={5}
        existingOperationRepresentatives={existingOperationRepresentativesMock}
        contacts={contactsMock}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /add new operation representative/i,
      }),
    );
    await userEvent.click(
      screen.getByRole("combobox", {
        name: /select existing contact \(optional\)/i,
      }),
    );
    // Mock the getContact function before selecting an existing contact
    actionHandler.mockReturnValueOnce({
      id: 1,
      first_name: "Henry",
      last_name: "Ives",
      position_title: "Senior Officer",
      email: "henry.ives@email.com",
      phone_number: "+16044011234",
    });
    await userEvent.click(
      screen.getByRole("option", {
        name: /henry ives/i,
      }),
    );

    expect(actionHandler).toHaveBeenNthCalledWith(
      1,
      "registration/contacts/1",
      "GET",
      "",
    );

    // check for the form to be filled with the selected contact
    expect(screen.getByLabelText(/First Name/i)).toHaveValue("Henry");
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue("Ives");
    expect(screen.getByLabelText(/Job Title \/ Position/i)).toHaveValue(
      "Senior Officer",
    );
    expect(screen.getByLabelText(/Business Email Address/i)).toHaveValue(
      "henry.ives@email.com",
    );
    expect(screen.getByLabelText(/Business Telephone Number/i)).toHaveValue(
      "604 401 1234",
    );
    // check for empty address fields - validation errors
    const errorMessages = screen.getAllByText("Required field");
    expect(errorMessages).toHaveLength(4);

    // Clearing the selected contact - must clear the form
    await userEvent.clear(
      screen.getByRole("combobox", {
        name: /select existing contact \(optional\)/i,
      }),
    );
    checkEmptyOperationRepresentativeForm();
  });

  it(
    "render the NewOperationRepresentativeForm component WITHOUT an existing operation representative",
    async () => {
      const { rerender } = render(
        <NewOperationRepresentativeForm
          formData={{
            operation_representatives: [],
          }}
          operation={operationId}
          step={5}
          existingOperationRepresentatives={[]}
          contacts={contactsMock}
        />,
      );

      expect(
        screen.queryByText(/operation representative\(s\):/i),
      ).not.toBeInTheDocument();
      expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();

      //This button should be visible if we have no existing operation representatives
      const saveOperationRepresentativeButton = screen.getByRole("button", {
        name: /save operation representative/i,
      });
      expect(saveOperationRepresentativeButton).toBeVisible();

      expect(
        screen.queryByRole("button", {
          name: /add new operation representative/i,
        }),
      ).not.toBeInTheDocument();
      checkEmptyOperationRepresentativeForm();
      await fillOperationRepresentativeForm();

      actionHandler.mockReturnValueOnce({
        id: 4,
      });
      await userEvent.click(saveOperationRepresentativeButton);

      expect(actionHandler).toHaveBeenNthCalledWith(
        1,
        `registration/operations/${operationId}/registration/operation-representative`,
        "POST",
        `/register-an-operation/${operationId}/5`,
        {
          body: JSON.stringify({
            first_name: "Isaac",
            last_name: "Newton",
            position_title: "Scientist",
            email: "isaac.newton@email.com",
            phone_number: "+1 1 604 401 4321",
            street_address: "123 Under the Apple Tree",
            municipality: "Gravityville",
            province: "AB",
            postal_code: "A1B2C3",
          }),
        },
      );

      // Check for the success message
      expect(
        screen.getByText(/operation representative saved successfully/i),
      ).toBeVisible();

      rerender(
        <NewOperationRepresentativeForm
          formData={{
            operation_representatives: [4],
          }}
          operation={operationId}
          step={5}
          existingOperationRepresentatives={[
            {
              id: 4,
              full_name: "Isaac Newton",
            },
          ]}
          contacts={contactsMock}
        />,
      );
      checkEmptyOperationRepresentativeForm();
      expect(screen.getByText(/operation representative\(s\):/i)).toBeVisible();
      expect(screen.getByText(/isaac newton/i)).toBeVisible();
    },
    { timeout: 10000 },
  );
  it("remove an operation representative", async () => {
    render(
      <NewOperationRepresentativeForm
        formData={{
          operation_representatives: [3],
        }}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        step={5}
        existingOperationRepresentatives={existingOperationRepresentativesMock}
        contacts={contactsMock}
      />,
    );
    await userEvent.click(screen.getByTestId("DeleteOutlineIcon"));
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/registration/operation-representative",
      "PUT",
      "registration/administration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d",
      {
        body: '{"id":3}',
      },
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Operation Representative removed successfully/i),
      ).toBeVisible();
    });
  });
});
