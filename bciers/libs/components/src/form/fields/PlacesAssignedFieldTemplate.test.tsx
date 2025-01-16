import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import PlacesAssignedFieldTemplate from "./PlacesAssignedFieldTemplate";

const mockSchema: RJSFSchema = {
  type: "object",
  properties: {
    places_assigned: {
      type: "array",
      title: "Places assigned",
      readOnly: true,
      items: {
        type: "object",
        properties: {
          role_name: { type: "string" },
          operation_name: { type: "string" },
          operation_id: { type: "string" },
        },
      },
    },
  },
};

const mockUiSchema = {
  places_assigned: {
    "ui:ArrayFieldTemplate": PlacesAssignedFieldTemplate,
    "ui:classNames": "[&>div:last-child]:w-2/3",
    items: {
      "ui:widget": "ReadOnlyWidget",
      "ui:options": {
        label: false,
        inline: true,
      },
      role_name: {
        "ui:options": {
          label: false,
        },
      },
      operation_name: {
        "ui:options": {
          label: false,
        },
      },
      operation_id: {
        "ui:widget": "hidden",
      },
    },
  },
};

const mockFormData = {
  places_assigned: [
    {
      role_name: "testrole",
      operation_name: "testoperation",
      operation_id: "uuid1",
    },
  ],
};

describe("RJSF PlacesAssignedFieldTemplate", () => {
  it("should render the field template when there are no places assigned", async () => {
    render(
      <FormBase schema={mockSchema} uiSchema={mockUiSchema} formData={{}} />,
    );
    expect(screen.getByText("None")).toBeVisible();
  });
  it("should render the field template when formData is provided", async () => {
    render(
      <FormBase
        schema={mockSchema}
        uiSchema={mockUiSchema}
        formData={mockFormData}
      />,
    );
    expect(screen.getByText("testrole -")).toBeVisible();
    expect(screen.getByText("testoperation")).toBeVisible();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/operations/uuid1?operations_title=testoperation&from_contacts=true",
    );
    expect(
      screen.getByText(
        "You cannot delete this contact unless you replace them with other contact(s) in the place(s) above.",
      ),
    ).toBeVisible();
  });

  it("should throw an error if given bad formData", async () => {
    expect(() =>
      render(
        <FormBase
          schema={mockSchema}
          uiSchema={mockUiSchema}
          formData={{ places_assigned: ["garbage"] }}
        />,
      ),
    ).toThrow("Invalid places assigned data");
  });
});
