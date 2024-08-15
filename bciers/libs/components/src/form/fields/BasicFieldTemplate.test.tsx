import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";

const mockSchema: RJSFSchema = {
  type: "object",
  properties: {
    testField: {
      type: "string",
      title: "Test Field",
    },
  },
};

const mockUiSchema = {
  testField: {
    "ui:FieldTemplate": BasicFieldTemplate,
    "ui:widget": "CheckboxWidget",
  },
};

describe("RJSF BasicFieldTemplate", () => {
  it("should render a field", async () => {
    render(<FormBase schema={mockSchema} uiSchema={mockUiSchema} />);
    expect(screen.getAllByLabelText("Test Field")[1]).toBeVisible();
  });
});
