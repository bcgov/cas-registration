import { render, screen, fireEvent } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import BasicFieldTemplate from "@bciers/components/form/fields/BasicFieldTemplate";
import NestedArrayFieldTemplate from "./NestedArrayFieldTemplate";

const schema: RJSFSchema = {
  type: "object",
  properties: {
    units: {
      type: "array",
      title: "Units",
      items: {
        type: "object",
        properties: {
          unitName: { type: "string", title: "Unit Name" },
        },
      },
    },
  },
};

const uiSchema = {
  units: {
    "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
    "ui:options": {
      arrayAddLabel: "Add Unit",
      title: "Unit",
      bgColor: "#f2f2f2",
      showSeparator: true, // set to true to test the horizontal rule rendering
      padding: "p-2",
      verticalBorder: true,
    },
    "ui:FieldTemplate": BasicFieldTemplate,
  },
};

describe("NestedArrayFieldTemplate in FormBase", () => {
  const formDataMultiple = {
    units: [{ unitName: "Test Unit 1" }, { unitName: "Test Unit 2" }],
  };
  const formDataSingle = {
    units: [{ unitName: "Test Unit" }],
  };

  it("renders the remove button when readonly is false", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataMultiple}
        readonly={false}
      />,
    );
    // Expect at least one remove button (identified by aria-label "Remove item")
    const removeButtons = screen.getAllByRole("button", {
      name: /remove item/i,
    });
    expect(removeButtons.length).toBeGreaterThan(0);

    // Optionally, simulate a click on the first remove button
    fireEvent.click(removeButtons[0]);
    // In a real-world scenario, you might check that the item was removed from the form data.
  });

  it("does not render the remove button when readonly is true", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataMultiple}
        readonly={true}
      />,
    );
    const removeButton = screen.queryByRole("button", {
      name: /remove item/i,
    });
    expect(removeButton).toBeNull();
  });

  it("renders the add button when form is not readonly and can add", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataSingle}
        readonly={false}
      />,
    );
    const addButton = screen.getByRole("button", { name: /add unit/i });
    expect(addButton).toBeVisible();

    // Optionally, simulate a click on the add button
    fireEvent.click(addButton);
    // Further checks can verify that the form data was updated with a new item.
  });

  it("does not render the add button when form is readonly", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataSingle}
        readonly={true}
      />,
    );
    const addButton = screen.queryByRole("button", { name: /add unit/i });
    expect(addButton).toBeNull();
  });

  it("renders custom title with correct index for each item", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataMultiple}
        readonly={false}
      />,
    );
    // Custom titles are rendered with an index (starting at 1)
    expect(screen.getByText("Unit 1")).toBeInTheDocument();
    expect(screen.getByText("Unit 2")).toBeInTheDocument();
  });

  it("renders a horizontal rule when showSeparator is true", () => {
    render(
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataMultiple}
        readonly={false}
      />,
    );
    // <hr> elements are recognized with the "separator" role
    const hrElements = screen.getAllByRole("separator");
    expect(hrElements.length).toBeGreaterThan(0);
  });
});
