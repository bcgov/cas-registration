/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

// Helper function to verify that icon is visible and has the expected styles
export const expectIcon = (
  testId: string,
  expectedStyles: Partial<CSSStyleDeclaration> = {
    color: "#FF0000",
    fontSize: "50px",
  },
) => {
  const element = screen.getByTestId(testId); // Find the element by its data-testid

  expect(element).toBeVisible(); // Check that the element is visible
  expect(element).toHaveStyle(expectedStyles); // Check that the element has the expected styles
};

export default expectIcon;
