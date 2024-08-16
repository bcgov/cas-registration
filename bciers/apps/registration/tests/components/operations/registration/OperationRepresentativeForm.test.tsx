import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { actionHandler, useRouter, useSession } from "@bciers/testConfig/mocks";
import { operationRepresentativeSchema } from "@/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import { createOperationRepresentativeSchema } from "@/registration/app/components/operations/registration/OperationRepresentativePage";
import userEvent from "@testing-library/user-event";
import {
  checkEmptyContactForm,
  fillContactForm,
  // eslint-disable-next-line import/extensions
} from "@/administration/tests/components/contacts/ContactForm.test";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const mockPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

const testSchema = createOperationRepresentativeSchema(
  operationRepresentativeSchema,
  [
    {
      id: "00000000-0000-0000-0000-000000000001",
      first_name: "Existing contact 1",
      last_name: "last",
    },
    {
      id: "279c80cf-5781-4c28-8727-40a133d17c0d",
      first_name: "Existing contact 2",
      last_name: "last 2",
    },
  ],
  [
    {
      id: "00000000-0000-0000-0000-000000000001",
      full_name: "Samantha Garcia",
    },
    {
      id: "279c80cf-5781-4c28-8727-40a133d17c0d",
      full_name: "Wednesday Addams",
    },
  ],
);

describe("the OperationRepresentativeForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OperationRepresentativeForm component", async () => {
    render(
      <OperationRepresentativeForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={testSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
    expect(screen.getByLabelText(/Operation Representative/i)).toBeVisible();
    userEvent.click(
      screen.getByRole("button", { name: "Add another representative" }),
    );
    await waitFor(() => {
      expect(screen.getByText(/Operation Representative 1/i)).toBeVisible();
    });
    checkEmptyContactForm();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeVisible();
    expect(
      screen.getByRole("button", { name: /save and continue/i }),
    ).toBeVisible();
  });

  it("should submit when existing contacts are selected", async () => {
    render(
      <OperationRepresentativeForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={testSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );
    actionHandler.mockReturnValueOnce({
      id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
      name: "Operation 2",
      error: undefined,
    });
    const openMultiSelectButton = screen.getByRole("button", { name: "Open" });
    await userEvent.click(openMultiSelectButton);

    await userEvent.click(screen.getByText(/Existing contact 1+/i));

    await userEvent.click(openMultiSelectButton);

    await userEvent.click(screen.getByText(/Existing contact 2+/i));

    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/operation_representative",
        "PUT",
        "",
        {
          body: JSON.stringify({
            operation_representatives: [
              "00000000-0000-0000-0000-000000000001",
              "279c80cf-5781-4c28-8727-40a133d17c0d",
            ],
            new_operation_representatives: [],
          }),
        },
      );
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/register-an-operation/002d5a9e-32a6-4191-938c-2c02bfec592d/6?title=002d5a9e-32a6-4191-938c-2c02bfec592d",
    );
  });

  it("should submit when a new contact is added", async () => {
    render(
      <OperationRepresentativeForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={testSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );
    actionHandler.mockReturnValueOnce({
      id: "002d5a9e-32a6-4191-938c-2c02bfec592d",
      name: "Operation 2",
      error: undefined,
    });

    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    await fillContactForm();
    // Submit
    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/operation_representative",
        "PUT",
        "",
        {
          body: JSON.stringify({
            operation_representatives: [],
            new_operation_representatives: [
              {
                section1: {
                  existing_bciers_user: false,
                  first_name: "John",
                  last_name: "Doe",
                },
                section2: {
                  position_title: "Senior Officer",
                },
                section3: {
                  email: "john.doe@example.com",
                  phone_number: "+1 1 604 401 1234",
                },
                section4: {
                  street_address: "123 Main St",
                  municipality: "Cityville",
                  province: "AB",
                  postal_code: "A1B2C3",
                },
              },
            ],
          }),
        },
      );
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/register-an-operation/002d5a9e-32a6-4191-938c-2c02bfec592d/6?title=002d5a9e-32a6-4191-938c-2c02bfec592d",
    );
  });

  it("should not submit when there are validation errors", async () => {
    render(
      <OperationRepresentativeForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={testSchema}
        step={5}
        steps={allOperationRegistrationSteps}
      />,
    );
    // trigger the error on the multiselect box
    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(
        screen.getAllByText(
          /You must select or add at least one representative/i,
        ),
      ).toHaveLength(1);
    });
    // trigger the error on the contacts form
    await userEvent.click(screen.getByRole("button", { name: /add/i }));
    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(6);
    });
  });
});
