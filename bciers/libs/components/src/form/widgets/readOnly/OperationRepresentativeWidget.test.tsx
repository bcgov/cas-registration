import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { actionHandler } from "@bciers/testConfig/mocks";

const operationRepresentativeWidgetLabel = "Operation Representative(s)";
const operationRepresentativeValue = [1, 2];

const operationRepresentativeWidgetSchema = {
  type: "object",
  properties: {
    operationRepresentativeTestField: {
      type: "array",
      title: operationRepresentativeWidgetLabel,
      minItems: 1,
      items: {
        type: "string",
        enum: [1, 2],
        enumNames: ["Neville Flashdance", "Oz Twindlewinks"],
      },
    },
  },
} as RJSFSchema;

const operationRepresentativeWidgetUiSchema = {
  operationRepresentativeTestField: {
    "ui:widget": "OperationRepresentativeWidget",
  },
};

const defaultFormContext = {
  operationId: "6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
};

describe("RJSF OperationRepresentativeWidget", () => {
  it("should render the field with no data", async () => {
    const { container } = render(
      <FormBase
        schema={operationRepresentativeWidgetSchema}
        uiSchema={operationRepresentativeWidgetUiSchema}
        formContext={defaultFormContext}
      />,
    );
    const operationRepresentativeTestField = container.querySelector(
      "#root_operationRepresentativeTestField",
    );
    expect(operationRepresentativeTestField).toBeVisible();
  });

  it("should show the operation reprentatives when formData provided", () => {
    const { container } = render(
      <FormBase
        schema={operationRepresentativeWidgetSchema}
        uiSchema={operationRepresentativeWidgetUiSchema}
        formData={{
          operationRepresentativeTestField: operationRepresentativeValue,
        }}
        formContext={defaultFormContext}
      />,
    );
    const operationRepresentativeTestField = container.querySelector(
      "#root_operationRepresentativeTestField",
    );
    expect(operationRepresentativeTestField).toBeVisible();
    expect(operationRepresentativeTestField).toHaveTextContent(
      "Neville FlashdanceOz Twindlewinks",
    );
    expect(screen.getAllByTestId("DeleteOutlineIcon")).toHaveLength(2);
  });

  it("should hit the API to remove a contact", async () => {
    render(
      <FormBase
        schema={operationRepresentativeWidgetSchema}
        uiSchema={operationRepresentativeWidgetUiSchema}
        formContext={defaultFormContext}
        formData={{
          operationRepresentativeTestField: operationRepresentativeValue,
        }}
      />,
    );
    const trashNevilleButton = screen.getAllByTestId("DeleteOutlineIcon")[0];
    await userEvent.click(trashNevilleButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/v2/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/registration/operation-representative",
      "PUT",
      "registration/administration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
      {
        body: '{"id":1}',
      },
    );
    await waitFor(() => {
      expect(
        screen.getByText(/Operation Representative removed successfully/i),
      ).toBeVisible();
    });
  });

  it("should show an error if deletion fails", async () => {
    actionHandler.mockReturnValueOnce({ error: " i bork :(" });
    render(
      <FormBase
        schema={operationRepresentativeWidgetSchema}
        uiSchema={operationRepresentativeWidgetUiSchema}
        formContext={defaultFormContext}
        formData={{
          operationRepresentativeTestField: operationRepresentativeValue,
        }}
      />,
    );
    const trashNevilleButton = screen.getAllByTestId("DeleteOutlineIcon")[0];
    await userEvent.click(trashNevilleButton);
    expect(actionHandler).toHaveBeenCalledWith(
      "registration/v2/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/registration/operation-representative",
      "PUT",
      "registration/administration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
      {
        body: '{"id":1}',
      },
    );
    expect(screen.getByText(/i bork :\(/i)).toBeVisible();
    await waitFor(() => {
      expect(
        screen.queryByText(/Operation Representative removed successfully/i),
      ).not.toBeInTheDocument();
    });
  });
});
