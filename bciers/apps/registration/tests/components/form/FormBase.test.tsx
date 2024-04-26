import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import React from "react";
import FormBase from "@/app/components/form/FormBase";
import readOnlyTheme from "@/app/components/form/readOnlyTheme";

const testSchema = {
  type: "object",
  required: ["field"],
  properties: {
    field: {
      type: "string",
    },
  },
};

const testUiSchema = {
  type: {
    "ui:widget": "TextWidget",
  },
};

describe("The FormBase component", () => {
  it("renders a test schema with the default theme", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test field" },
      uiSchema: testUiSchema,
    } as any;

    render(<FormBase {...props} />);

    // this confirms we're using the default (editable) theme because the label is accompanied by an <input>
    expect(screen.getByLabelText(/field/i)).toHaveValue("test field");
  });

  it("renders a test schema with the readonly theme", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test field" },
      uiSchema: testUiSchema,
      theme: readOnlyTheme,
    } as any;

    render(<FormBase {...props} />);

    // can't getByLabel because there's no <input> element in the readonly theme
    expect(screen.getByText(/test field/i)).toHaveAttribute(
      "class",
      "read-only-widget",
    );
  });

  it("maintains form state on unsuccessful submit", async () => {
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
    await fireEvent.click(submitButton);
    expect(screen.getByText(/required field/i)).toBeVisible(); // field2 is required and was left blank
    expect(screen.getByLabelText(/field1/i)).toHaveValue("test");
    await fireEvent.change(field2, { target: { value: "anything" } });
    await fireEvent.click(submitButton);
    expect(screen.queryByText(/required field/i)).not.toBeInTheDocument();
  });

  it("resets errors on submit", async () => {
    const props = {
      schema: testSchema,
    } as any;
    render(<FormBase {...props} />);
    const submitButton = screen.getByRole("button", { name: /Submit/i });
    const input = screen.getByRole("textbox", { name: "field*" });
    await fireEvent.click(submitButton);
    expect(screen.getByText(/required field/i)).toBeVisible();
    await fireEvent.change(input, { target: { value: "anything" } });
    await fireEvent.click(submitButton);
    expect(screen.queryByText(/required field/i)).not.toBeInTheDocument();
  });
});
