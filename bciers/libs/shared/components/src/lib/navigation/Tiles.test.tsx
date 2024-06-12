import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import Tiles from "./Tiles";

const mockTilesWithLinks = [
  {
    links: [
      {
        href: "/registration/dashboard/select-operator",
        title: "My Operator",
      },
      {
        href: "/registration/tbd",
        title: "Operations",
      },
      {
        href: "/registration/tbd",
        title: "BORO ID Applications",
      },
      {
        href: "/registration/tbd",
        title: "Report an Event",
      },
      {
        href: "/registration/tbd",
        title: "Contacts",
      },
      {
        href: "/registration/tbd",
        title: "User and Access Requests",
      },
    ],
    title: "Registration",
    icon: "Inbox",
    content:
      "View or update your operator information, which needs to be complete before applying for BORO ID's",
  },
  {
    links: [
      {
        href: "/reporting/tbd",
        title: "Submit Annual Report",
      },
      {
        href: "/reporting/tbd",
        title: "View Past Submissions",
      },
    ],
    title: "Reporting",
    icon: "Layers",
    content:
      "Submit annual report for an  and to view or update previous year's reports here",
  },
  {
    links: [
      {
        href: "/coam/tbd",
        title: "TBD",
      },
      {
        href: "/coam/tbd",
        title: "TBD",
      },
      {
        href: "/coam/tbd",
        title: "TBD",
      },
    ],
    title: "COAM",
    icon: "Pulse",
    content: "View payments for compliance obligations here",
  },
  {
    links: [
      {
        href: "mailto:GHGRegulator@gov.bc.ca",
        title: "Report problems to GHGRegulator@gov.bc.ca",
      },
    ],
    title: "Report a problem",
    icon: "Wrench",
    content: "Something wrong?",
  },
];

const mockTilesWithHref = [
  {
    href: "/registration/dashboard/select-operator",
    icon: "Inbox",
    title: "My Operator",
    content:
      "View or update your operator information, which needs to be complete before applying for BORO ID's",
  },
  {
    href: "/registration/tbd",
    icon: "Layers",
    title: "Operations",
    content: "View or update your operator information",
  },
  {
    href: "mailto:GHGRegulator@gov.bc.ca",
    icon: "Wrench",
    title: "Report a problem",
    content: "Something wrong?",
  },
];

describe("The Tiles component", () => {
  it("renders a list of tiles with links", () => {
    render(<Tiles tiles={mockTilesWithLinks} />);

    expect(screen.getAllByRole("link")).toHaveLength(12);

    // Registration tile
    expect(
      screen.getByRole("heading", { name: "Registration" }),
    ).toBeInTheDocument();

    // Registration tile links
    expect(screen.getByRole("link", { name: "My Operator" })).toHaveAttribute(
      "href",
      "/registration/dashboard/select-operator",
    );
    expect(screen.getByRole("link", { name: "Operations" })).toHaveAttribute(
      "href",
      "/registration/tbd",
    );
    expect(
      screen.getByRole("link", { name: "BORO ID Applications" }),
    ).toHaveAttribute("href", "/registration/tbd");
    expect(
      screen.getByRole("link", { name: "Report an Event" }),
    ).toHaveAttribute("href", "/registration/tbd");
    expect(screen.getByRole("link", { name: "Contacts" })).toHaveAttribute(
      "href",
      "/registration/tbd",
    );
    expect(
      screen.getByRole("link", { name: "User and Access Requests" }),
    ).toHaveAttribute("href", "/registration/tbd");
    expect(
      screen.getByRole("link", { name: "Submit Annual Report" }),
    ).toHaveAttribute("href", "/reporting/tbd");

    // Reporting tile
    expect(
      screen.getByRole("heading", { name: "Reporting" }),
    ).toBeInTheDocument();

    // Reporting tile links
    expect(
      screen.getByRole("link", { name: "Submit Annual Report" }),
    ).toHaveAttribute("href", "/reporting/tbd");
    expect(
      screen.getByRole("link", { name: "View Past Submissions" }),
    ).toHaveAttribute("href", "/reporting/tbd");

    // COAM tile
    expect(screen.getByRole("heading", { name: "COAM" })).toBeInTheDocument();

    // COAM tile links
    expect(screen.getAllByRole("link", { name: "TBD" })).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: "TBD" })[0]).toHaveAttribute(
      "href",
      "/coam/tbd",
    );

    // Report a Problem tile
    expect(
      screen.getByRole("heading", { name: "Report a problem" }),
    ).toBeInTheDocument();

    // Report a Problem tile links
    expect(
      screen.getByRole("link", {
        name: "Report problems to GHGRegulator@gov.bc.ca",
      }),
    ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
  });

  it("renders a list of tiles with href", () => {
    render(<Tiles tiles={mockTilesWithHref} />);

    expect(screen.getAllByRole("link")).toHaveLength(4);

    // My Operator tile
    expect(
      screen.getByRole("heading", { name: "My Operator" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "My Operator" })).toHaveAttribute(
      "href",
      "/registration/dashboard/select-operator",
    );

    // Submit Annual Report tile
    expect(
      screen.getByRole("heading", { name: "Submit Annual Report" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Submit Annual Report" }),
    ).toHaveAttribute("href", "/reporting/tbd");

    // COAM tile
    expect(screen.getByRole("heading", { name: "COAM" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "COAM" })).toHaveAttribute(
      "href",
      "/coam/tbd",
    );

    // Report a Problem tile
    expect(
      screen.getByRole("heading", { name: "Report a problem" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Report a problem",
      }),
    ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
  });
});
