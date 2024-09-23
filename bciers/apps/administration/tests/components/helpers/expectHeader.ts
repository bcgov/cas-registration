/* eslint-disable import/no-extraneous-dependencies */
import { screen } from "@testing-library/react";

// Helper function to verify that a header is visible

function expectHeader(headers: string[]) {
  headers.forEach((header) => {
    expect(screen.getByRole("heading", { name: header })).toBeVisible();
  });
}

export default expectHeader;
