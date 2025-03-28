import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { checkNoValidationErrorIsTriggered } from "@bciers/testConfig/helpers/form";

const url = "https://example.com";
const urlFieldLabel = "URL test field";
const urlLabelRequired = `${urlFieldLabel}*`;
const urlErrorMessage =
  "Please enter a valid website link, e.g. http://www.website.com, https://www.website.com";

const urlFieldSchema = {
  type: "object",
  required: ["urlTestField"],
  properties: {
    urlTestField: { type: "string", format: "uri", title: urlFieldLabel },
  },
} as RJSFSchema;

const urlFieldUiSchema = {
  urlTestField: {
    "ui:widget": "URLWidget",
  },
};

describe("RJSF URLWidget", () => {
  it("should render a URL field", async () => {
    render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);
    expect(screen.getByLabelText(urlLabelRequired)).toBeVisible();
  });

  it("should be empty by default", async () => {
    render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);

    const input = screen.getByLabelText(urlLabelRequired);

    expect(input).toHaveValue("");
  });

  it("should render the URL value when formData is provided", async () => {
    render(
      <FormBase
        schema={urlFieldSchema}
        formData={{ urlTestField: url }}
        uiSchema={urlFieldUiSchema}
      />,
    );

    const input = screen.getByLabelText(urlLabelRequired);
    expect(input).toHaveValue(url);
  });

  it("should allow entering a URL", async () => {
    render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);
    const input = screen.getByLabelText(urlLabelRequired);
    await userEvent.type(input, url);
    expect(input).toHaveValue(url);
  });

  it("should trigger validation error for invalid URL", async () => {
    render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);
    const input = screen.getByLabelText(urlLabelRequired);
    await userEvent.type(input, "example.com");

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(urlErrorMessage)).toBeVisible();
  });

  it("should not trigger validation error for valid URL", async () => {
    render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);
    const input = screen.getByLabelText(urlLabelRequired);
    await userEvent.type(input, url);

    await checkNoValidationErrorIsTriggered();
    expect(screen.queryByText(urlErrorMessage)).toBeNull();
  });

  it("should allow clearing the field", async () => {
    render(
      <FormBase
        schema={{
          type: "object",
          properties: {
            urlTestField: {
              type: "string",
              format: "uri",
              title: urlFieldLabel,
            },
          },
        }}
        uiSchema={urlFieldUiSchema}
        formData={{ urlTestField: url }}
      />,
    );
    const input = screen.getByLabelText(urlFieldLabel);
    expect(input).toHaveValue(url);
    await userEvent.clear(input);
    await checkNoValidationErrorIsTriggered();
    expect(screen.queryByText(urlErrorMessage)).toBeNull();
  });

  // Todo: Fix bug preventing required field validation
  // https://github.com/bcgov/cas-registration/issues/1612

  // it("should trigger validation error for required field", async () => {
  //   render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);
  //   const submitButton = screen.getByRole("button", { name: "Submit" });
  //
  //   await userEvent.click(submitButton);
  //
  //   expect(screen.getByText("Required field")).toBeVisible();
  // });

  // it("should have the correct styling when validation is triggered", async () => {
  //   await checkTextWidgetValidationStyles(
  //     <FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />,
  //     urlLabelRequired,
  //     "example.com",
  //   );
  // });
});
