import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "../app/page";
import { auth } from "@bciers/testConfig/mocks";

const tiles = [
  {
    title: "Registry",
    icon: "File",
    content: "TBD here.",
    href: "/coam/tbd",
  },
  {
    title: "Compensation Obligation",
    icon: "File",
    content: "TBD here.",
    href: "/coam/tbd",
  },
];

vi.mock("@bciers/actions/server", () => ({
  fetchDashboardData: vi.fn(() => tiles),
}));

describe("COAM dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the dashboard page with the correct tiles", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "cas_admin" },
    });

    render(await Page());

    expect(screen.getByRole("heading", { name: /registry/i })).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /compensation obligation/i }),
    ).toBeVisible();
  });
});
