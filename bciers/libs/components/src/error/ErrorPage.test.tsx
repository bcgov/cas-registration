/**
 * @file ErrorPage.test.tsx
 * @description Unit tests for the ErrorPage and ErrorBoundary components.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorPage from "./ErrorPage";
import ErrorBoundary from "./ErrorBoundary";
import * as Sentry from "@sentry/nextjs";

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

describe("ErrorBoundary", () => {
  /**
   * Test to ensure that the error is logged to Sentry and the console when the ErrorBoundary
   * component mounts with an error prop.
   */
  it("logs error to Sentry and console", () => {
    const error = new Error("Test error");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<ErrorBoundary error={error} />);

    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    consoleErrorSpy.mockRestore();
  });
});
