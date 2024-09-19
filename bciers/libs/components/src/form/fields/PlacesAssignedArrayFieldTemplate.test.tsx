import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { PlacesAssignedArrayFieldTemplate } from ".";

const arrayFieldSchema = {
  type: "object",
  properties: {
    places_assigned: {
      type: "array",
      title: "Places assigned",
      items: {
        type: "string",
      },
    },
  },
} as RJSFSchema;

describe("RJSF PlacesAssignedArrayFieldTemplate", () => {
  it("should render the correct values and note", () => {
    render(
      <FormBase
        disabled
        formData={{
          places_assigned: [
            "Operation Representative - Operation 1",
            "Operation Representative - Operation 25",
          ],
        }}
        schema={arrayFieldSchema}
        uiSchema={{
          places_assigned: {
            "ui:ArrayFieldTemplate": PlacesAssignedArrayFieldTemplate,
          },
        }}
      />,
    );
    expect(
      screen.getByText("Operation Representative - Operation 1"),
    ).toBeVisible();
    expect(
      screen.getByText("Operation Representative - Operation 25"),
    ).toBeVisible();
    expect(screen.getByText(/You cannot delete this contact/i)).toBeVisible();
  });
});
