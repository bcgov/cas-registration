import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

describe("Footer component", () => {
  describe("Render", () => {
    test("should render the footer element", () => {
      // 🧩  Arrange: Render the Footer component
      render(<Footer />);

      // 🚀 Act: Use the screen object find the footer element
      const footer = screen.getByRole("contentinfo");

      // 🔍 Assert: Footer element is present in the rendered component
      expect(footer).toBeInTheDocument();
    });
    test("should render the footer links", () => {
      // 🧩  Arrange: Render the Footer component
      render(<Footer />);

      // 🚀 Act: Test data for footerLinks
      const footerLinks = [
        {
          name: "Home",
          href: "/home",
          label: "Return to the Home Page",
          target: "_self",
        },
        {
          name: "Disclaimer",
          href: "https://www2.gov.bc.ca/gov/content/home/disclaimer",
          label:
            "To learn more, visit the Disclaimer page which opens in a new window.",
          target: "_blank",
        },
        {
          name: "Privacy",
          href: "https://www2.gov.bc.ca/gov/content/home/privacy",
          label:
            "To learn more, visit the Privacy page which opens in a new window.",
          target: "_blank",
        },
        {
          name: "Accessibility",
          href: "https://www2.gov.bc.ca/gov/content/home/accessible-government",
          label:
            "To learn more, visit the Accessibility page which opens in a new window.",
          target: "_blank",
        },
        {
          name: "Copyright",
          href: "https://www2.gov.bc.ca/gov/content/home/copyright",
          label: "Copyright",
          target: "_blank",
        },
        {
          name: "Contact Us",
          href: "mailto:GHGRegulator@gov.bc.ca",
          label:
            "To contact us, use the mailto link which opens in a new window.",
          target: "_blank",
        },
      ];
      // 🔍 Assert:  links are present in the Footer
      footerLinks.forEach((link) => {
        const linkElement = screen.getByRole("link", { name: link.label });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute("href", link.href);
        expect(linkElement).toHaveAttribute("target", link.target);
        expect(linkElement).toHaveTextContent(link.name);
      });
    });
  });
});
