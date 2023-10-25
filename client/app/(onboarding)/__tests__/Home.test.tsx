import { render, screen } from "@testing-library/react";
import Home from "@/app/(onboarding)/home/page";

describe("Home", () => {
  describe("Render", () => {
    test("should render the route (onboarding)/home/page", () => {
      // 🧩  Arrange: Render route
      render(<Home />);

      // 🚀 Act:
      const home = screen.getByRole("contentinfo");

      // 🔍 Assert: Footer element is present in the rendered component
      expect(home).toBeInTheDocument();
    });
  });
});
