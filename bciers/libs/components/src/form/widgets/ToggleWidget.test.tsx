import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import ToggleWidget from "./ToggleWidget";

const toggleFieldLabel = "Toggle test field";

const toggleFieldSchema: RJSFSchema = {
  type: "object",
  required: ["toggleTestField"],
  properties: {
    toggleTestField: {
      type: "boolean",
      title: toggleFieldLabel,
    },
  },
};

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

    const checkbox = screen.getByRole("checkbox").parentElement?.children[1];

    expect(checkbox).toBeVisible();
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

  it("should render custom true and false labels", async () => {
    render(
      <FormBase
        schema={toggleFieldSchema}
        uiSchema={{
          toggleTestField: {
            "ui:widget": "ToggleWidget",
            "ui:options": {
              trueLabel: "Affirmative",
              falseLabel: "Negative",
            },
          },
        }}
      />,
    );

    expect(screen.getByText("Negative")).toBeVisible();
  });

  it("switches visible labels when toggled", async () => {
    render(
      <FormBase
        schema={toggleFieldSchema}
        uiSchema={{
          toggleTestField: {
            "ui:widget": "ToggleWidget",
            "ui:options": {
              trueLabel: "Dog",
              falseLabel: "Cat",
            },
          },
        }}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    // OFF by default
    expect(screen.getByText("Cat")).toBeVisible();
    expect(screen.getByText("Dog")).toHaveStyle({ opacity: "0" });

    checkbox.click();

    expect(screen.getByText("Dog")).toBeVisible();
  });

  it("does not toggle when disabled", async () => {
    render(
      <FormBase
        schema={toggleFieldSchema}
        uiSchema={{
          toggleTestField: {
            "ui:widget": "ToggleWidget",
            "ui:disabled": true,
          },
        }}
      />,
    );

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeDisabled();

    checkbox.click();

    expect(checkbox).not.toBeChecked();
  });

  it("prioritizes direct props over ui:options labels", async () => {
    render(
      <ToggleWidget
        id="test"
        value={false}
        onChange={vi.fn()}
        trueLabel="Direct ON"
        falseLabel="Direct OFF"
        options={{ trueLabel: "Option ON", falseLabel: "Option OFF" }}
      />,
    );

    expect(screen.getByText("Direct OFF")).toBeVisible();
  });
});
