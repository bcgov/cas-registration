/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

function expectField(fields: string[], expectedValue: string | null = "") {
  fields.forEach((fieldLabel) => {
    let element;
    try {
      element = screen.getByLabelText(new RegExp(fieldLabel, "i"));
    } catch (error) {
      // If getByLabelText fails, try to find the element by text
      element = screen.getByText(new RegExp(fieldLabel, "i"));
    }

    expect(element).toBeInTheDocument();

    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement
    ) {
      expect(element).toHaveValue(expectedValue);
    } else {
      // For non-input elements, just check if they're visible
      expect(element).toBeVisible();
    }
  });
}

export default expectField;
