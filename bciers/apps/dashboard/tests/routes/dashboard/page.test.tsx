import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import DashboardPage from "apps/dashboard/app/dashboard/page";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

vi.mock("@bciers/utils/src/sessionUtils", () => ({
  getSessionRole: vi.fn(),
}));

const roles = [
  "cas_admin",
  "cas_analyst",
  "industry_user",
  "industry_user_admin",
];

const tiles = [
  {
    title: "Registration",
    href: "/registration",
    icon: "Layers",
    content:
      "View or update information of your operator, operations, facilities, contacts, and to register operations or report events here.",
    links: [
      {
        title: "My Operator",
        href: "/registration/select-operator",
      },
      {
        title: "Operations",
        href: "/registration/operations",
      },
      {
        title: "Contacts",
        href: "/registration/tbd",
      },
      {
        title: "Users and Access Requests",
        href: "/registration/tbd",
      },
      {
        title: "Register an Operation",
        href: "/registrationd/tbd",
      },
      {
        title: "Report an Event",
        href: "/registration/tbd",
      },
    ],
  },
  {
    title: "Reporting",
    href: "/reporting/dashboard",
    icon: "File",
    content:
      "Submit Annual Report for an operation, and to view or update previous years' reports here.",
    links: [
      {
        title: "Submit Annual Reports",
        href: "/reporting/tbd",
      },
      {
        title: "View Past Submissions",
        href: "/reporting/tbd",
      },
    ],
  },
  {
    title: "Compliance",
    href: "/compliance/",
    icon: "Pulse",
    content: "View and pay compliance obligations here.",
    links: [
      {
        title: "Compliance TBD 1",
        href: "/compliance/",
      },
      {
        title: "Compliance TBD 2",
        href: "/compliance/",
      },
      {
        title: "Compliance TBD 3",
        href: "/compliance/",
      },
    ],
  },
  {
    title: "Report a Problem",
    href: "mailto:GHGRegulator@gov.bc.ca",
    icon: "Wrench",
    content: "Report a problem or contact us here.",
    links: [
      {
        title: "Report problems to GHGRegulator@gov.bc.ca",
        href: "mailto:GHGRegulator@gov.bc.ca",
      },
    ],
  },
];

const noteContent =
  "Important: Please always ensure that the information in Registration is complete and accurate before submitting or amending reports in Reporting.";

const msgContent = "Welcome to B.C. Industrial Emissions Reporting System";

vi.mock("@bciers/actions", () => ({
  fetchDashboardData: vi.fn(() => tiles),
}));

describe("Registration dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard page with the correct tiles", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue("cas_admin");

    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { name: /registration/i }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: /reporting/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /compliance/i })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /report a problem/i }),
    ).toBeVisible();
  });

  it("renders the correct links for each tile", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue("cas_admin");

    render(await DashboardPage());

    // Registration tile
    const registrationTitleLink = screen.getByRole("link", {
      name: /Registration/,
    });
    expect(registrationTitleLink).toBeVisible();
    expect(registrationTitleLink).toHaveAttribute("href", "/registration");
    const registrationLink1 = screen.getByRole("link", {
      name: /View or update information of your operator/i,
    });
    expect(registrationLink1).toBeVisible();
    expect(registrationLink1).toHaveAttribute("href", "/registration");
    const registrationLink2 = screen.getByRole("link", {
      name: /My Operator/i,
    });
    expect(registrationLink2).toBeVisible();
    expect(registrationLink2).toHaveAttribute(
      "href",
      "/registration/select-operator",
    );
    const registrationLink3 = screen.getByRole("link", { name: "Operations" });
    expect(registrationLink3).toBeVisible();
    expect(registrationLink3).toHaveAttribute(
      "href",
      "/registration/operations",
    );
    const registrationLink4 = screen.getByRole("link", { name: "Contacts" });
    expect(registrationLink4).toBeVisible();
    expect(registrationLink4).toHaveAttribute("href", "/registration/tbd");
    const registrationLink5 = screen.getByRole("link", {
      name: /Users and Access Requests/i,
    });
    expect(registrationLink5).toBeVisible();
    expect(registrationLink5).toHaveAttribute("href", "/registration/tbd");
    const registrationLink6 = screen.getByRole("link", {
      name: /Register an Operation/i,
    });
    expect(registrationLink6).toBeVisible();
    expect(registrationLink6).toHaveAttribute("href", "/registrationd/tbd");

    // Reporting tile
    const reportingTitleLink = screen.getByRole("link", { name: /Reporting/ });
    expect(reportingTitleLink).toBeVisible();
    expect(reportingTitleLink).toHaveAttribute("href", "/reporting/dashboard");
    const reportingLink1 = screen.getByRole("link", {
      name: /Submit Annual Reports/i,
    });
    expect(reportingLink1).toBeVisible();
    expect(reportingLink1).toHaveAttribute("href", "/reporting/tbd");
    const reportingLink2 = screen.getByRole("link", {
      name: /View Past Submissions/i,
    });
    expect(reportingLink2).toBeVisible();
    expect(reportingLink2).toHaveAttribute("href", "/reporting/tbd");

    // Compliance tile
    const complianceTitleLink = screen.getByRole("link", {
      name: /View and pay compliance obligations here./i,
    });
    expect(complianceTitleLink).toBeVisible();
    expect(complianceTitleLink).toHaveAttribute("href", "/compliance/");
    const complianceLinks = screen.getAllByRole("link", {
      name: /Compliance TBD/i,
    });
    expect(complianceLinks).toHaveLength(3);
    expect(complianceLinks[2]).toHaveAttribute("href", "/compliance/");

    expect(
      screen.getByRole("link", { name: /report problems to/i }),
    ).toBeVisible();
  });

  it("renders the Note component for industry_admin role", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
      "industry_admin",
    );

    render(await DashboardPage());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(noteContent);
  });

  it("renders the Note component for industry_user role", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
      "industry_user",
    );

    render(await DashboardPage());

    const note = screen.getByTestId("note");
    expect(note).toBeVisible();
    expect(note).toHaveTextContent(noteContent);
  });

  it("does not render the Note component for cas_admin", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue("cas_admin");

    render(await DashboardPage());

    expect(screen.queryByTestId("note")).not.toBeInTheDocument();
  });

  it("does not render the Note component for cas_analyst", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
      "cas_analyst",
    );

    render(await DashboardPage());

    expect(screen.queryByTestId("note")).not.toBeInTheDocument();
  });

  it("renders the dashboard-pending-message card for cas_pending role", async () => {
    (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(
      "cas_pending",
    );

    render(await DashboardPage());

    const msg = screen.getByTestId("dashboard-pending-message");
    expect(msg).toBeVisible();
    expect(msg).toHaveTextContent(msgContent);
  });

  it.each(roles)(
    "does not render the dashboard-pending-message card for role: %s",
    async (role) => {
      (getSessionRole as ReturnType<typeof vi.fn>).mockResolvedValue(role);

      render(await DashboardPage());

      expect(
        screen.queryByTestId("dashboard-pending-message"),
      ).not.toBeInTheDocument();
    },
  );
});
