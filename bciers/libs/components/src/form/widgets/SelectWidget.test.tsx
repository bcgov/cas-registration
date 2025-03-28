import { userEvent } from "@testing-library/user-event";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import {
  checkComboBoxWidgetValidationStyles,
  checkNoValidationErrorIsTriggered,
} from "@bciers/testConfig/helpers/form";

const selectFieldLabel = "SelectWidget test field";
const selectFieldRequiredLabel = `${selectFieldLabel}*`;

const selectFieldSchema = {
  type: "object",
  required: ["selectTestField"],
  properties: {
    selectTestField: {
      type: "string",
      title: selectFieldLabel,
      enum: ["Option 1", "Option 2", "Option 3"],
    },
  },
} as RJSFSchema;

const selectFieldUiSchema = {
  selectTestField: {
    "ui:widget": "SelectWidget",
    "ui:placeholder": "Select an option",
  },
};

describe("RJSF SelectWidget", () => {
  it("should render a select field", async () => {
    render(
      <FormBase schema={selectFieldSchema} uiSchema={selectFieldUiSchema} />,
    );
    expect(screen.getByText(selectFieldRequiredLabel)).toBeVisible();
  });

  it("should display the selected value when formData is provided", async () => {
    render(
      <FormBase
        schema={selectFieldSchema}
        formData={{ selectTestField: "Option 2" }}
        uiSchema={selectFieldUiSchema}
      />,
    );

    expect(screen.getByText("Option 2")).toBeVisible();
  });

  it("should allow selecting a value", async () => {
    render(
      <FormBase schema={selectFieldSchema} uiSchema={selectFieldUiSchema} />,
    );

    const selectField = screen.getByRole("combobox");

    act(() => {
      fireEvent.mouseDown(selectField);
    });

    await waitFor(() => {
      userEvent.click(screen.getByRole("option", { name: "Option 2" }));
    });

    expect(screen.getByRole("option", { name: "Option 2" })).toBeVisible();
  });

  it("should display the placeholder when no value is selected", async () => {
    render(
      <FormBase schema={selectFieldSchema} uiSchema={selectFieldUiSchema} />,
    );

    expect(screen.getByText("Select an option")).toBeVisible();
  });

  it("should not trigger a validation error when data is valid", async () => {
    render(
      <FormBase
        schema={selectFieldSchema}
        formData={{ selectTestField: "Option 2" }}
        uiSchema={selectFieldUiSchema}
      />,
    );
    await checkNoValidationErrorIsTriggered();
  });

  it("should display an error message when the field is required", async () => {
    const placeholderUiSchema = {
      selectTestField: {
        "ui:widget": "SelectWidget",
      },
    };
    render(
      <FormBase schema={selectFieldSchema} uiSchema={placeholderUiSchema} />,
    );

    const submitButton = screen.getByRole("button", { name: /submit/i });

    await userEvent.click(submitButton);

    expect(screen.getByText("Required field")).toBeVisible();
  });

  it("should have the correct styles when there is a validation error", async () => {
    await checkComboBoxWidgetValidationStyles(
      <FormBase schema={selectFieldSchema} uiSchema={selectFieldUiSchema} />,
    );
  });
});
