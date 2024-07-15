import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";

const toggleFieldLabel = "Toggle test field";

const toggleFieldSchema = {
  type: "object",
  required: ["toggleTestField"],
  properties: {
    toggleTestField: {
      type: "boolean",
      title: toggleFieldLabel,
    },
  },
} as RJSFSchema;

const toggleFieldUiSchema = {
  checkboxTestField: {
    "ui:widget": "ToggleWidget",
  },
};

describe("RJSF ToggleWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render a toggle field", async () => {
    render(
      <FormBase schema={toggleFieldSchema} uiSchema={toggleFieldUiSchema} />,
    );
    expect(screen.getByLabelText(toggleFieldLabel)).toBeVisible();
  });

  it("should be unchecked by default", async () => {
    render(
      <FormBase schema={toggleFieldSchema} uiSchema={toggleFieldUiSchema} />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.to.have.property("checked", true);
  });

  it("should render the toggle value when formData is provided", async () => {
    render(
      <FormBase
        schema={toggleFieldSchema}
        formData={{ toggleTestField: true }}
        uiSchema={toggleFieldUiSchema}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeChecked();
  });

  it("should have property checked when the toggle is clicked", async () => {
    render(
      <FormBase schema={toggleFieldSchema} uiSchema={toggleFieldUiSchema} />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    checkbox.click();

    expect(checkbox).toBeChecked();
  });

  it("should allow unchecking the toggle", async () => {
    render(
      <FormBase schema={toggleFieldSchema} uiSchema={toggleFieldUiSchema} />,
    );

    const checkbox = screen.getByRole("checkbox");

    checkbox.click();

    expect(checkbox).toBeChecked();

    checkbox.click();

    expect(checkbox).not.toBeChecked();
  });
});
