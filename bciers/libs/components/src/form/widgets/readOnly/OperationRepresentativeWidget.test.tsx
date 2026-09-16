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
      },
    },
  },
} as RJSFSchema;

const operationRepresentativeWidgetUiSchema = {
  operationRepresentativeTestField: {
    "ui:widget": "OperationRepresentativeWidget",
    "ui:enumNames": ["Neville Flashdance", "Oz Twindlewinks"],
  },
};

const defaultFormContext = {
  operationId: "6d07d02a-1ad2-46ed-ad56-2f84313e98bf",
  step: 5,
};

const expectedRemoveCall = [
  "registration/operations/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/registration/operation-representative",
  "PUT",
  "/register-an-operation/6d07d02a-1ad2-46ed-ad56-2f84313e98bf/5",
  {
    body: '{"id":1}',
  },
];

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

  it("should show the operation representatives when formData provided", () => {
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
    const onChange = vi.fn();
    render(
      <FormBase
        schema={operationRepresentativeWidgetSchema}
        uiSchema={operationRepresentativeWidgetUiSchema}
        formContext={defaultFormContext}
        formData={{
          operationRepresentativeTestField: operationRepresentativeValue,
        }}
        onChange={onChange}
      />,
    );
    const trashNevilleButton = screen.getAllByTestId("DeleteOutlineIcon")[0];
    await userEvent.click(trashNevilleButton);
    expect(actionHandler).toHaveBeenCalledWith(...expectedRemoveCall);
    await waitFor(() => {
      expect(onChange.mock.calls[0][0].formData).toEqual({
        operationRepresentativeTestField: [2],
      });
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Operation Representative removed successfully/i),
      ).toBeVisible();
    });
  });

  it("should show an error if deletion fails", async () => {
    actionHandler.mockReturnValueOnce({ error: " i bork :(" });
    const onChange = vi.fn();
    render(
      <FormBase
        schema={operationRepresentativeWidgetSchema}
        uiSchema={operationRepresentativeWidgetUiSchema}
        formContext={defaultFormContext}
        formData={{
          operationRepresentativeTestField: operationRepresentativeValue,
        }}
        onChange={onChange}
      />,
    );
    const trashNevilleButton = screen.getAllByTestId("DeleteOutlineIcon")[0];
    await userEvent.click(trashNevilleButton);
    expect(actionHandler).toHaveBeenCalledWith(...expectedRemoveCall);
    expect(screen.getByText(/i bork :\(/i)).toBeVisible();
    // a failed deletion must leave the form data untouched
    expect(onChange).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByText(/Operation Representative removed successfully/i),
      ).not.toBeInTheDocument();
    });
  });
});
