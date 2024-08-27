import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { actionHandler, useRouter, useSession } from "@bciers/testConfig/mocks";
import { operationRepresentativeSchema } from "@/registration/app/data/jsonSchema/operationRegistration/operationRepresentative";
import OperationRepresentativeForm from "apps/registration/app/components/operations/registration/OperationRepresentativeForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import { createOperationRepresentativeSchema } from "@/registration/app/components/operations/registration/OperationRepresentativePage";
import userEvent from "@testing-library/user-event";

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
);

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
      screen.getByRole("button", {
        name: "Add Another Operation Representative",
      }),
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
        "registration/v2/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/registration/operation-representative",
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
        "registration/v2/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/registration/operation-representative",
        "PUT",
        "",
        {
          body: JSON.stringify({
            operation_representatives: [],
            new_operation_representatives: [
              {
                first_name: "John",
                last_name: "Doe",
                position_title: "Senior Officer",
                email: "john.doe@example.com",
                phone_number: "+1 1 604 401 1234",
                street_address: "123 Main St",
                municipality: "Cityville",
                province: "AB",
                postal_code: "A1B2C3",
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
      expect(screen.getAllByText(/Required field/i)).toHaveLength(5);
    });
  });
});
