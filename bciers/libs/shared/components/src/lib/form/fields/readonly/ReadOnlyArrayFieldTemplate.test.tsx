import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import readOnlyTheme from "../../theme/readOnlyTheme";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

const arrayFieldSchema = {
  type: "object",
  properties: {
    arrayTestField: {
      type: "array",
      title: "Array test field",
      items: { type: "number" },
    },
  },
} as RJSFSchema;

describe("RJSF ReadOnlyArrayFieldTemplate", () => {
  it("should render the correct values", () => {
    render(
      <FormBase
        disabled
        formData={{
          arrayTestField: [123, 456],
        }}
        schema={arrayFieldSchema}
        theme={readOnlyTheme}
      />,
    );
    expect(screen.getByText("123")).toBeVisible();
    expect(screen.getByText("456")).toBeVisible();
  });
});
