import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";

const checkboxGroupLabel = "Checkbox group test field";
const checkboxOptions = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
];

const checkboxGroupSchema = {
  type: "object",
  required: ["checkboxGroupTestField"],
  properties: {
    checkboxGroupTestField: {
      type: "array",
      title: checkboxGroupLabel,
      items: {
        type: "string",
        enum: ["option1", "option2", "option3"], // Ensure this matches your labels
      },
    },
  },
} as RJSFSchema;

const checkboxGroupUiSchema = {
  checkboxGroupTestField: {
    "ui:widget": "CheckboxGroupWidget",
    "ui:options": {
      columns: 2,
      alignment: "center",
    },
  },
};

describe("CheckboxGroupWidget", () => {
  const renderComponent = (formData = {}) => {
    render(
      <FormBase
        schema={checkboxGroupSchema}
        uiSchema={checkboxGroupUiSchema}
        formData={formData}
      />,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all checkbox options", () => {
    render(
      <FormBase
        schema={checkboxGroupSchema}
        uiSchema={checkboxGroupUiSchema}
      />,
    );

    expect(screen.getByText("option1")).toBeVisible();
  });

  it("initially has checkboxes unchecked", () => {
    renderComponent();

    checkboxOptions.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).not.toBeChecked();
    });
  });

  it("checks a checkbox when clicked", async () => {
    renderComponent();

    const checkbox = screen.getByLabelText("Option 1");
    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("unchecks a checkbox when clicked again", async () => {
    renderComponent();

    const checkbox = screen.getByLabelText("Option 1");
    await userEvent.click(checkbox); // Check
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox); // Uncheck
    expect(checkbox).not.toBeChecked();
  });

  it("renders checkboxes according to provided formData", () => {
    renderComponent({ checkboxGroupTestField: ["option1", "option2"] });

    expect(screen.getByLabelText("Option 1")).toBeChecked();
    expect(screen.getByLabelText("Option 2")).toBeChecked();
    expect(screen.getByLabelText("Option 3")).not.toBeChecked();
  });

  it("renders checkboxes in specified columns", () => {
    renderComponent();

    const formGroup = screen.getByRole("group");
    // This may need to be adjusted based on the actual styles applied
    expect(formGroup).toHaveStyle("grid-template-columns: repeat(2, 1fr)");
  });

  it("aligns checkbox labels as specified by the alignment option", () => {
    renderComponent();

    const checkboxLabel = screen
      .getByLabelText("Option 1")
      .closest(".MuiFormControlLabel-root");
    expect(checkboxLabel).toHaveStyle("align-items: center");
  });

  it("handles checking all checkboxes correctly", async () => {
    renderComponent();

    for (const { label } of checkboxOptions) {
      const checkbox = screen.getByLabelText(label);
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    }

    // Verify all checkboxes are checked
    checkboxOptions.forEach(({ label }) => {
      expect(screen.getByLabelText(label)).toBeChecked();
    });
  });
});
