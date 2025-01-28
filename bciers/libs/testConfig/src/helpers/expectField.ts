/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

function expectField(fields: string[]) {
  fields.forEach((fieldLabel) => {
    try {
      // Try getByRole first (more robust)
      screen.getByRole("textbox", { name: new RegExp(fieldLabel, "i") });
    } catch (roleError) {
      try {
        // If role fails, try full text match with getByText
        screen.getByText(new RegExp(fieldLabel, "i"));
      } catch (fullTextError) {
        try {
          // If full text fails, try split text match with getByText
          screen.getByText(new RegExp(fieldLabel.split(" ").join("|"), "i"));
        } catch (splitTextError) {
          throw splitTextError; // Re-throw the error to fail the test
        }
      }
    }
  });
}

export default expectField;
