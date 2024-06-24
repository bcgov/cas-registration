import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import DashboardPage from "../../app/dashboard/page";
import { auth } from "@bciers/testConfig/mocks";

const tiles = [
  {
    href: "/dashboard/select-operator",
    icon: "Inbox",
    title: "My Operator",
    content: "View or update information of your operator here.",
  },
  {
    href: "/registration/operations",
    icon: "Layers",
    title: "Operations",
    content:
      "View the operations owned by your operator, or to add and register new operation to your operator here.",
  },
  {
    href: "/registration/tbd",
    icon: "Users",
    title: "Contacts",
    content:
      "View the contacts of your operator, or to add new contact for your operator here.",
  },
  {
    href: "/registration/tbd",
    icon: "Users",
    title: "Users and Access Requests",
    content:
      "View, approve or decline Business BCeID user access requests to your operator, or to assign access type to users here.",
  },
  {
    href: "/registration/tbd",
    icon: "Layers",
    title: "Register an Operation",
    content:
      "Track the registration of operations, or to start new registration here.",
  },
  {
    href: "/registration/tbd",
    icon: "File",
    title: "Report an Event",
    content:
      "Report start up, closing, or temporary shutdown, acquisition, divestment, transer, etc. here.",
  },
];

vi.mock("@bciers/actions/server", () => ({
  fetchDashboardData: vi.fn(() => tiles),
}));

describe("Registration dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard page", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_admin" },
    });

    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: /my operator/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /operations/i })).toBeVisible();
    expect(screen.getByRole("heading", { name: /contacts/i })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /users and access requests/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /register an operation/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /report an event/i }),
    ).toBeVisible();
  });

  it("renders the correct links", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_admin" },
    });
    render(await DashboardPage());

    expect(screen.getByRole("link", { name: /my operator/i })).toHaveAttribute(
      "href",
      "/dashboard/select-operator",
    );
    expect(
      screen.getByRole("link", {
        name: /View the operations owned by your operator, or to add and register new operation to your operator here./i,
      }),
    ).toHaveAttribute("href", "/registration/operations");
    expect(screen.getByRole("link", { name: /contacts/i })).toHaveAttribute(
      "href",
      "/registration/tbd",
    );
    expect(
      screen.getByRole("link", { name: /users and access requests/i }),
    ).toHaveAttribute("href", "/registration/tbd");
    expect(
      screen.getByRole("link", { name: /register an operation/i }),
    ).toHaveAttribute("href", "/registration/tbd");
    expect(
      screen.getByRole("link", { name: /report an event/i }),
    ).toHaveAttribute("href", "/registration/tbd");
  });

  it("renders the correct content", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_admin" },
    });
    render(await DashboardPage());

    expect(
      screen.getByText(/View or update information of your operator here./i),
    ).toBeVisible();
    expect(
      screen.getByText(
        /View the operations owned by your operator, or to add and register new operation to your operator here./i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        /View the contacts of your operator, or to add new contact for your operator here./i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        /View, approve or decline Business BCeID user access requests to your operator, or to assign access type to users here./i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        /Track the registration of operations, or to start new registration here./i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        /Report start up, closing, or temporary shutdown, acquisition, divestment, transer, etc. here./i,
      ),
    ).toBeVisible();
  });

  it("renders the pending message for internal users", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_pending" },
    });
    render(await DashboardPage());

    expect(
      screen.getByText(
        /Welcome to B.C. Industrial Emissions Reporting System/i,
      ),
    ).toBeVisible();
    expect(
      screen.getByText(/Your access request is pending approval./i),
    ).toBeVisible();
    expect(
      screen.getByText(
        /Once approved, you can log back in with access to the system./i,
      ),
    ).toBeVisible();
  });
});
