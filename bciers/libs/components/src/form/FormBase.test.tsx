import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import FormBase from "@bciers/components/form/FormBase";
import readOnlyTheme from "@bciers/components/form/theme/readOnlyTheme";

const testSchema = {
  type: "object",
  required: ["field"],
  properties: {
    field: {
      type: "string",
    },
  },
};

describe("The FormBase component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("renders a test schema with the default theme", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test field" },
    } as any;

    render(<FormBase {...props} />);

    // this confirms we're using the default (editable) theme because the label is accompanied by an <input>
    expect(screen.getByLabelText(/field/i)).toHaveValue("test field");
  });

  it("renders a test schema and a test ui schema", () => {
    const props = {
      schema: testSchema,
      uiSchema: {
        field: {
          "ui:widget": "PhoneWidget",
        },
      },
    } as any;

    render(<FormBase {...props} />);

    // // this confirms we're using the custom uiSchema because the phone number widget shows the area code
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders a test schema with the readonly theme", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test field" },
      theme: readOnlyTheme,
    } as any;

    render(<FormBase {...props} />);

    // can't getByLabel because there's no <input> element in the readonly theme
    expect(screen.getByText(/test field/i)).toHaveAttribute(
      "class",
      "read-only-widget whitespace-pre-line",
    );
  });

  it("maintains form state on unsuccessful submit", () => {
    const mockOnSubmit = vitest.fn();
    const props = {
      schema: {
        type: "object",
        required: ["field1", "field2"],
        properties: {
          field1: {
            type: "string",
          },
          field2: {
            type: "string",
          },
        },
      },
      formData: { field1: "test" },
      onSubmit: mockOnSubmit,
    } as any;

    render(<FormBase {...props} />);

    const submitButton = screen.getByRole("button", { name: /Submit/i });
    const field2 = screen.getByRole("textbox", { name: "field2*" });
    fireEvent.click(submitButton);
    expect(screen.getByText(/^.* is required/i)).toBeVisible(); // field2 is required and was left blank
    expect(screen.getByLabelText(/field1/i)).toHaveValue("test");
    fireEvent.change(field2, { target: { value: "anything" } });
    fireEvent.click(submitButton);
    expect(screen.queryByText(/^.* is required/i)).not.toBeInTheDocument();
  });

  it("resets errors on submit", () => {
    const props = {
      schema: testSchema,
    } as any;
    render(<FormBase {...props} />);
    const submitButton = screen.getByRole("button", { name: /Submit/i });
    const input = screen.getByRole("textbox", { name: "field*" });
    fireEvent.click(submitButton);
    expect(screen.getByText(/^.* is required/i)).toBeVisible();
    fireEvent.change(input, { target: { value: "anything" } });
    fireEvent.click(submitButton);
    expect(screen.queryByText(/^.* is required/i)).not.toBeInTheDocument();
  });
});
