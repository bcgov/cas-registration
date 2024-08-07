import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import React from "react";
import { useSession, useRouter } from "@bciers/testConfig/mocks";
import { operationInformationSchema } from "@/registration/app/data/jsonSchema/operationRegistration/operationInformation";
import OperationInformationForm from "apps/registration/app/components/operations/registration/OperationInformationForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import userEvent from "@testing-library/user-event";
import { actionHandler } from "@bciers/testConfig/mocks";

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

const localSchema = operationInformationSchema;
localSchema.properties.registration_purpose.anyOf = [
  {
    const: "Potential Reporting Operation",
    title: "Potential Reporting Operation",
  },
  { const: "OBPS Regulated Operation", title: "OBPS Regulated Operation" },
];
localSchema.properties.operation.anyOf = [
  { const: "uuid1", title: "Operation 1" },
  { const: "uuid2", title: "Operation 2" },
];
localSchema.dependencies = {
  registration_purpose: {
    allOf: [
      {
        if: {
          properties: {
            registration_purpose: {
              const: "OBPS Regulated Operation",
            },
          },
        },
        then: {
          required: ["regulated_products"],
          properties: {
            regulated_products: {
              type: "array",
              items: {
                type: "number",
                enum: [1, 2, 3],
                enumNames: [
                  "BC-specific refinery complexity throughput",
                  "Cement equivalent",
                  "Chemicals: pure hydrogen peroxide",
                ],
              },
              title: "Regulated Product Name(s):",
            },
          },
        },
      },
    ],
  },
};

describe("the OperationInformationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the OperationInformationForm component", () => {
    render(
      <OperationInformationForm
        formData={{}}
        schema={operationInformationSchema}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
    expect(
      screen.getByLabelText(
        /The purpose of this registration is to register as a/i,
      ),
    ).toBeVisible();
    expect(screen.getByLabelText(/Select your operation/i)).toBeVisible();
    expect(
      screen.getByRole("button", { name: /save and continue/i }),
    ).toBeVisible();
  });
  it("should submit when a purpose without regulated products is selected", async () => {
    actionHandler.mockReturnValueOnce({ id: "uuid2", name: "Operation 2" });
    render(
      <OperationInformationForm
        formData={{}}
        schema={localSchema}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    const purposeInput = screen.getByRole("combobox", {
      name: /The purpose of this registration+/i,
    });

    const openPurposeDropdownButton = purposeInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;

    await userEvent.click(openPurposeDropdownButton);
    const purposeOption = screen.getByText("Potential Reporting Operation");
    await userEvent.click(purposeOption);

    expect(
      screen.queryByPlaceholderText(/select regulated product/i),
    ).not.toBeInTheDocument();

    const operationInput = screen.getByRole("combobox", {
      name: /Select your operation+/i,
    });
    const openOperationsDropdownButton = operationInput?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openOperationsDropdownButton);
    const operationOption = screen.getByText(/Operation 2/i);
    await userEvent.click(operationOption);

    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/operations/uuid2/1",
        "PUT",
        "",
        {
          body: JSON.stringify({
            registration_purpose: "Potential Reporting Operation",
            operation: "uuid2",
          }),
        },
      );
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/register-an-operation/uuid2/2?title=Operation 2",
    );
  });
  it("should submit when a purpose with regulated products is selected", async () => {
    actionHandler.mockReturnValueOnce({ id: "uuid2", name: "Operation 2" });
    render(
      <OperationInformationForm
        formData={{}}
        schema={localSchema}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );

    const purposeInput = screen.getByRole("combobox", {
      name: /The purpose of this registration+/i,
    });

    const openPurposeDropdownButton = purposeInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;

    await userEvent.click(openPurposeDropdownButton);
    const purposeOption = screen.getByText("OBPS Regulated Operation");
    await userEvent.click(purposeOption);

    const regulatedProductsInput = screen.getByPlaceholderText(
      /select regulated product.../i,
    );

    const openProductsDropdown = regulatedProductsInput?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openProductsDropdown);
    const product1 = screen.getByText(
      "BC-specific refinery complexity throughput",
    );
    await userEvent.click(product1);
    await userEvent.click(openProductsDropdown);
    const product2 = screen.getByText("Cement equivalent");
    await userEvent.click(product2);

    const operationInput = screen.getByRole("combobox", {
      name: /Select your operation+/i,
    });
    const openOperationsDropdownButton = operationInput?.parentElement
      ?.children[1]?.children[0] as HTMLInputElement;
    await userEvent.click(openOperationsDropdownButton);
    const operationOption = screen.getByText(/Operation 2/i);
    await userEvent.click(operationOption);

    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        "registration/v2/operations/uuid2/1",
        "PUT",
        "",
        {
          body: JSON.stringify({
            registration_purpose: "OBPS Regulated Operation",
            operation: "uuid2",
            regulated_products: [1, 2],
          }),
        },
      );
    });
    expect(mockPush).toHaveBeenCalledWith(
      "/register-an-operation/uuid2/2?title=Operation 2",
    );
  });
  it("should trigger required field errors when a purpose without regulated products", async () => {
    render(
      <OperationInformationForm
        formData={{}}
        schema={localSchema}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );
    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(2);
    });
  });
  it("should trigger required field errors with regulated products", async () => {
    render(
      <OperationInformationForm
        formData={{}}
        schema={localSchema}
        step={1}
        steps={allOperationRegistrationSteps}
      />,
    );
    // set purpose to make regulated products field show up
    const purposeInput = screen.getByRole("combobox", {
      name: /The purpose of this registration+/i,
    });

    const openPurposeDropdownButton = purposeInput?.parentElement?.children[1]
      ?.children[0] as HTMLInputElement;

    await userEvent.click(openPurposeDropdownButton);
    const purposeOption = screen.getByText("OBPS Regulated Operation");
    await userEvent.click(purposeOption);
    // try to continue without filling anything else out
    userEvent.click(screen.getByRole("button", { name: /save and continue/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/Required field/i)).toHaveLength(2);
    });
  });
});
