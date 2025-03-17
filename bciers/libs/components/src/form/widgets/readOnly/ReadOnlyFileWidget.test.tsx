import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import {
  testDataUriClean,
  testDataUriUnscanned,
  testDataUriQuarantined,
  fileFieldSchema,
  fileFieldUiSchema,
} from "../FileWidget.test";

describe("RJSF ReadOnlyFileWidget", () => {
  it("should render a file field with correct message when scanStatus is Unscanned", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{ fileTestField: testDataUriUnscanned }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("Upload in progress....");
  });

  it("should render a file field with correct message when scanStatus is Quarantined", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{ fileTestField: testDataUriQuarantined }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("Security risk found.");
  });

  it("should render a file field with correct message when scanStatus is Clean", async () => {
    const { container } = render(
      <FormBase
        disabled
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{ fileTestField: testDataUriClean }}
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
