/**
 * @file ErrorPage.test.tsx
 * @description Unit tests for the ErrorPage and ErrorBoundary components.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "./ErrorPage";

// Mock the Sentry module to avoid actual error logging during tests
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

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
