/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

// Helper function to verify that a link with a specific name and href is visible
export const expectLink = (name: string, href: string) => {
  const link = screen.getByRole("link", { name }); // Find the link by its accessible name
  expect(link).toBeVisible(); // Check that the link is visible
  expect(link).toHaveAttribute("href", href); // Check that the link has the correct href attribute
};

export default expectLink;
