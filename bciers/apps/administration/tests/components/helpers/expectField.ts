/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

// Helper function to verify that a field with a specific name is visible and has no value

function expectField(fields: string[], expectedValue: string | null = "") {
  fields.forEach((fieldLabel) => {
    const input = screen.getByLabelText(new RegExp(fieldLabel, "i"));
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(expectedValue);
  });
}

export default expectField;
