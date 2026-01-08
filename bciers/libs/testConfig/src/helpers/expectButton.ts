import { screen } from "@testing-library/react";

// Helper function to verify that a button with a specific name is visible and enabled/disabled based on the isEnabled parameter
export const expectButton = (name: string, isEnabled: boolean = true) => {
  const button = screen.getByRole("button", { name }); // Find the button by its accessible name

  expect(button).toBeVisible();

  if (isEnabled) {
    expect(button).toBeEnabled();
  } else {
    expect(button).toBeDisabled();
  }
};

export default expectButton;
