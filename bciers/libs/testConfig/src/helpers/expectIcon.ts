import { screen } from "@testing-library/react";

// Helper function to verify that icon is visible and has the expected Tailwind classes
// (Tailwind's CSS isn't loaded in tests, so we check classes instead of computed styles)
export const expectIcon = (testId: string, expectedClasses: string[] = []) => {
  const element = screen.getByTestId(testId); // Find the element by its data-testid

  expect(element).toBeVisible(); // Check that the element is visible
  expect(element).toHaveClass(...expectedClasses); // Check that the element has the expected classes
};

export default expectIcon;
