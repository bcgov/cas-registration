import { render, screen } from "@testing-library/react";
import Page from "../../src/app/page";

const mockSignIn = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: mockSignIn,
}));

describe("The landing page", () => {
  it("renders a login button", () => {
    render(<Page />);
    screen.getByText(/Log in with IDIR/).click();
    expect(mockSignIn).toHaveBeenCalled();
  });
});
