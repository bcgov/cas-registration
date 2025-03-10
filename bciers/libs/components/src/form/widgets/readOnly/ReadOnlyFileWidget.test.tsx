import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import { fileFieldSchema, fileFieldUiSchema } from "../FileWidget.test";
import { mockFile } from "@bciers/testConfig/constants";

describe("RJSF ReadOnlyFileWidget", () => {
  global.URL.createObjectURL = vi.fn(
    () => "this is the link to download the File",
  );
  it("should render a file field", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{ fileTestField: mockFile }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("test.pdf");
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
