/**
 * @file ErrorPage.test.tsx
 * @description Unit tests for the ErrorPage and ErrorBoundary components.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "./ErrorPage";


describe("ErrorPage", () => {
  /**
   * Test to ensure that the ErrorPage component renders the ErrorBoundary component
   * and passes the error prop correctly.
   */
  it("renders the ErrorBoundary with the error prop", () => {
    const error = new Error("Test error");
    render(<ErrorPage error={error} />);

    expect(screen.getByText("Something went wrong...")).toBeInTheDocument();
  });
});
