import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import Tiles from "./Tiles";

const mockTilesWithLinks = [
  {
    title: "Registration",
    href: "/registration/dashboard",
    icon: "Inbox",
    content:
      "View or update information of your operator, operations, facilities, and to register operations here.",
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
  },
  {
    title: "Reporting",
    href: "/reporting/tbd",
    icon: "Layers",
    content:
      "Submit Annual Report for an operation, and to view or update previous years’ reports here.",
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
  },
  {
    title: "Compliance",
    href: "/compliance/tbd",
    icon: "Pulse",
    content: "View payments for compliance obligations here",
    links: [
      {
        href: "/compliance/tbd",
        title: "TBD",
      },
      {
        href: "/compliance/tbd",
        title: "TBD",
      },
      {
        href: "/compliance/tbd",
        title: "TBD",
      },
    ],
  },
  {
    title: "Report a problem",
    href: "mailto:GHGRegulator@gov.bc.ca",
    icon: "Wrench",
    content: "Something wrong?",
    links: [
      {
        href: "mailto:GHGRegulator@gov.bc.ca",
        title: "Report problems to GHGRegulator@gov.bc.ca",
      },
    ],
  },
];

const mockTilesWithoutLinks = [
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
    content: "View all operations here",
  },
  {
    href: "mailto:GHGRegulator@gov.bc.ca",
    icon: "Wrench",
    title: "Report a problem",
    content: "Something wrong?",
  },
];

describe("The Tiles component", () => {
  it("renders a list of tiles without links", () => {
    render(<Tiles tiles={mockTilesWithoutLinks} />);

    // Operator tile
    expect(
      screen.getByRole("heading", { name: "My Operator" }),
    ).toBeInTheDocument();

    // Operator tile content
    expect(
      screen.getByText(
        "View or update your operator information, which needs to be complete before applying for BORO ID's",
      ),
    ).toBeInTheDocument();

    // Operations tile
    expect(
      screen.getByRole("heading", { name: "Operations" }),
    ).toBeInTheDocument();

    // Operations tile content
    expect(screen.getByText("View all operations here")).toBeInTheDocument();

    // Report a Problem tile
    expect(
      screen.getByRole("heading", { name: "Report a problem" }),
    ).toBeInTheDocument();

    // Report a Problem tile content
    expect(screen.getByText("Something wrong?")).toBeInTheDocument();
  });

  it("renders a list of tiles with links", () => {
    render(<Tiles tiles={mockTilesWithLinks} />);

    // Registration tile
    expect(
      screen.getByRole("heading", { name: "Registration" }),
    ).toBeInTheDocument();

    // Registration tile content
    expect(
      screen.getByText(
        "View or update information of your operator, operations, facilities, and to register operations here.",
      ),
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

    // Reporting tile content
    expect(
      screen.getByText(
        "Submit Annual Report for an operation, and to view or update previous years’ reports here.",
      ),
    ).toBeInTheDocument();

    // Reporting tile links
    expect(
      screen.getByRole("link", { name: "Submit Annual Report" }),
    ).toHaveAttribute("href", "/reporting/tbd");
    expect(
      screen.getByRole("link", { name: "View Past Submissions" }),
    ).toHaveAttribute("href", "/reporting/tbd");

    // Compliance tile
    expect(screen.getByRole("heading", { name: "Compliance" })).toBeInTheDocument();

    // Compliance tile content
    expect(
      screen.getByText("View payments for compliance obligations here"),
    ).toBeInTheDocument();

    // Compliance tile links
    expect(screen.getAllByRole("link", { name: "TBD" })).toHaveLength(3);
    expect(screen.getAllByRole("link", { name: "TBD" })[0]).toHaveAttribute(
      "href",
      "/compliance/tbd",
    );

    // Report a Problem tile
    expect(
      screen.getByRole("heading", { name: "Report a problem" }),
    ).toBeInTheDocument();

    // Report a Problem tile content
    expect(screen.getByText("Something wrong?")).toBeInTheDocument();

    // Report a Problem tile links
    expect(
      screen.getByRole("link", {
        name: "Report problems to GHGRegulator@gov.bc.ca",
      }),
    ).toHaveAttribute("href", "mailto:GHGRegulator@gov.bc.ca");
  });

  // it("renders a list of tiles with and without links", () => {
  //   render(<Tiles tiles={[...mockTilesWithLinks, ...mockTilesWithoutLinks]} />);
  //
  //   // Registration tile
  //   expect(
  //     screen.getByRole("heading", { name: "Registration" }),
  //   ).toBeInTheDocument();
  //
  //   // Registration tile content
  //   expect(
  //     screen.getByText(
  //       "View or update your operator information, which needs to be complete before applying for BORO ID's",
  //     ),
  //   ).toBeInTheDocument();
  //
  //   // Registration tile links
  //   expect(screen.getByRole("link", { name: "My Operator" })).toHaveAttribute(
  //     "href",
  //     "/registration/dashboard/select-operator",
  //   );
  //
  //   // Operator tile
  //   expect(
  //     screen.getByRole("heading", { name: "My Operator" }),
  //   ).toBeInTheDocument();
  //
  //   // Operator tile content
  //   expect(
  //     screen.getByText(
  //       "View or update information of your operator, operations, facilities, and to register operations here.",
  //     ),
  //   ).toBeInTheDocument();
  // });
});
