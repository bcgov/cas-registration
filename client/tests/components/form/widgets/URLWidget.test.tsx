import { userEvent } from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";
// import { checkTextWidgetValidationStyles } from "@/tests/helpers/form";

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

  // it("should trigger validation error for required field", async () => {
  //   render(<FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />);
  //   const submitButton = screen.getByRole("button", { name: "Submit" });
  //
  //   await userEvent.click(submitButton);
  //
  //   expect(screen.getByText("Required field")).toBeVisible();
  // });

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

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.queryByText(urlErrorMessage)).toBeNull();
  });

  // it("should have the correct styling when validation is triggered", async () => {
  //   await checkTextWidgetValidationStyles(
  //     <FormBase schema={urlFieldSchema} uiSchema={urlFieldUiSchema} />,
  //     urlLabelRequired,
  //     "example.com",
  //   );
  // });
});
