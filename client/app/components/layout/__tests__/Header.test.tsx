import { render, screen } from "@testing-library/react";
import Header from "../Header";
import React from "react";

// Mock the usePathname hook
jest.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

describe("Header component", () => {
  describe("Render", () => {
    test("should render the header element", () => {
      // 🧩  Arrange: Render the Header component
      render(<Header />);

      // 🚀 Act: Use the screen object find the header element
      const header = screen.getByRole("banner");

      // 🔍 Assert: Check that the header element is present in the rendered component
      expect(header).toBeInTheDocument();
    });

    test("should render the img element", () => {
      // 🧩  Arrange: Render the Header component
      render(<Header />);

      // 🚀 Act: Use the screen object to find the img element by its alt text
      const image = screen.getByAltText(
        "Logo for Province of British Columbia CleanBC",
      );

      // 🔍 Assert: Check that the image element is present in the rendered component
      expect(image).toBeInTheDocument();
    });
  });
  describe("Behavior", () => {
    test("should render the Login component links when not authenticated", () => {
      // 🧩  Arrange: Mock not authenticated state
      jest.spyOn(React, "useState").mockReturnValueOnce([false, jest.fn()]);
      render(<Header />);

      //🚀 Act: Use the screen object to query for the links based on their text content
      const adminLink = screen.getByRole("link", {
        name: "Program Administrator Log In",
      });
      const operLink = screen.getByRole("link", {
        name: "Industrial Operator Log In",
      });

      // 🔍 Assert: Check that the not authenticated links are present in the rendered component
      expect(adminLink).toBeInTheDocument();
      expect(operLink).toBeInTheDocument();
    });
    test("should render the Profile component links when authenticated", () => {
      // 🧩  Arrange: Mock authenticated state
      jest.spyOn(React, "useState").mockReturnValueOnce([true, jest.fn()]);
      render(<Header />);

      //🚀 Act: Use the screen object to query for the links based on their text content
      const userLink = screen.getByRole("link", {
        name: "User",
      });
      const logoutLink = screen.getByRole("link", {
        name: "Log out",
      });
      // 🔍 Assert: Check that the authenticated links are present in the rendered component
      expect(userLink).toBeInTheDocument();
      expect(logoutLink).toBeInTheDocument();
    });
  });
});
