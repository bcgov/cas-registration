import { render, screen } from "@testing-library/react";
import Page from "../../src/app/page";
import { vi } from "vitest";

describe("The landing page", () => {
  // Hoist the mock setup to ensure proper initialization
  const mockSignIn = vi.hoisted(() => vi.fn());

  vi.mock("next-auth/react", () => ({
    signIn: mockSignIn,
  }));

  it("renders a login button", () => {
    render(<Page />);
    screen.getByText(/Log in with IDIR/).click();
    expect(mockSignIn).toHaveBeenCalled();
  });
});
