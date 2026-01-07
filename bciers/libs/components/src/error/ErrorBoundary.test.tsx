/**
 * @file ErrorPage.test.tsx
 * @description Unit tests for the ErrorPage and ErrorBoundary components.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// Mock the Sentry config module that ErrorBoundary imports from
// Use vi.hoisted() to ensure the mock function is available during hoisting
const { captureExceptionMock } = vi.hoisted(() => {
  return {
    captureExceptionMock: vi.fn(),
  };
});

vi.mock("@bciers/sentryConfig/sentry", () => ({
  captureException: captureExceptionMock,
}));

describe("ErrorBoundary", () => {
  /**
   * Test to ensure that the error is logged to Sentry and the console when the ErrorBoundary
   * component mounts with an error prop.
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("logs error to Sentry and console with reference code", () => {
    const error = new Error("Test error");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    captureExceptionMock.mockReturnValue("sentry-event-id");

    render(<ErrorBoundary error={error} />);
    expect(
      screen.getByText("An internal server error has occured."),
    ).toBeVisible();
    expect(screen.getByText(/Please refresh the page/i)).toBeInTheDocument();

    // Assert the email link
    const emailLink = screen.getByRole("link", {
      name: /ghgregulator@gov\.bc\.ca/i,
    });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");

    const reference = screen.getByText(/sentry-event-id/i);
    expect(reference.tagName.toLowerCase()).toBe("strong");

    expect(captureExceptionMock).toHaveBeenCalledWith(error);
    consoleErrorSpy.mockRestore();
  });

  it("shows 'pending' instead of reference code if not available", () => {
    const error = new Error("Test error");
    captureExceptionMock.mockReturnValue(undefined);

    render(<ErrorBoundary error={error} />);

    const reference = screen.getByText(/pending/i);
    expect(reference.tagName.toLowerCase()).toBe("strong");
  });
});
