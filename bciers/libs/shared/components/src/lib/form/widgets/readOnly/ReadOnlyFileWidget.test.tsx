import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import {
  testDataUri,
  fileFieldSchema,
  fileFieldUiSchema,
} from "../FileWidget.test";

describe("RJSF ReadOnlyFileWidget", () => {
  it("should render a file field", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{ fileTestField: testDataUri }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("testpdf.pdf");
  });

  it("should be have the correct message when no value is provided", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("No attachment was uploaded");
  });
});
