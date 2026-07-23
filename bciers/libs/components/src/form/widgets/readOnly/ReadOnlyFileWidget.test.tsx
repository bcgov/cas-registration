import { render } from "@testing-library/react";
import FormBase from "@bciers/components/form/FormBase";
import { fileFieldSchema, fileFieldUiSchema } from "../FileWidget.test";

describe("RJSF ReadOnlyFileWidget", () => {
  it("should render a file field with correct message when scanStatus is Unscanned", async () => {
    const { container } = render(
      <FormBase
        disabled
        readonly
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{
          fileTestField: JSON.stringify({
            name: "test.pdf",
            status: "Unscanned",
          }),
        }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent(
      "Uploading. You may continue to the next page while the file is being scanned for security.",
    );
  });

  it("should render a file field with correct message when scanStatus is Quarantined", async () => {
    const { container } = render(
      <FormBase
        disabled
        readonly
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{
          fileTestField: JSON.stringify({
            name: "test.pdf",
            status: "Quarantined",
          }),
        }}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent(
      'Security risk found in "test.pdf". Check for malware or upload a different file.',
    );
  });

  it("should render a file field with correct message when scanStatus is Clean", async () => {
    const { container } = render(
      <FormBase
        disabled
        readonly
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{
          fileTestField: JSON.stringify({ name: "test.pdf", status: "Clean" }),
        }}
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
        readonly
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
      />,
    );

    const readOnlyFileWidget = container.querySelector("#root_fileTestField");

    expect(readOnlyFileWidget).toBeVisible();
    expect(readOnlyFileWidget).toHaveTextContent("No attachment was uploaded.");
  });
});
