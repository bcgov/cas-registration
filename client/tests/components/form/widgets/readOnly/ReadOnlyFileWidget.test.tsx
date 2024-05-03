import { render } from "@testing-library/react";
import FormBase from "@/app/components/form/FormBase";
import {
  dummyDataUri,
  fileFieldSchema,
  fileFieldUiSchema,
} from "@/tests/components/form/widgets/FileWidget.test";

describe("RJSF ReadOnlyFileWidget", () => {
  it("should render a file field", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{ fileTestField: dummyDataUri }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("dummy.pdf");
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
