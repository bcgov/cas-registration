/**
 * @file ErrorPage.test.tsx
 * @description Unit tests for the ErrorPage and ErrorBoundary components.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";
import { captureException } from "@bciers/testConfig/mocks";

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

    captureException.mockReturnValue("sentry-event-id");

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

    expect(captureException).toHaveBeenCalledWith(error);
    consoleErrorSpy.mockRestore();
  });

  it("shows 'pending' instead of reference code if not available", () => {
    const error = new Error("Test error");
    captureException.mockReturnValue(undefined);

    render(<ErrorBoundary error={error} />);

    const reference = screen.getByText(/pending/i);
    expect(reference.tagName.toLowerCase()).toBe("strong");
  });
});
