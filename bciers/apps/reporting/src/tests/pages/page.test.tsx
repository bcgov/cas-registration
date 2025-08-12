import Page from "@reporting/src/app/page";
import { render, screen } from "@testing-library/react";
const tiles = [
  {
    title: "View Annual Reports",
    icon: "fa-file-pdf",
    href: "/reporting/operations",
  },
  {
    title: "View Past Submissions",
    icon: "fa-file-pdf",
    href: "/reporting/tbd",
  },
];

vi.mock("@bciers/actions", () => ({
  fetchDashboardData: vi.fn(() => tiles),
}));

describe("Page", () => {
  it("renders the reporting page dashboard tiles", async () => {
    render(await Page());

    expect(
      screen.getByRole("heading", { name: /view annual reports/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: /view past submissions/i }),
    ).toBeVisible();
  });

  it("renders the correct links for each tile", async () => {
    render(await Page());

    const submitTitleLink = screen.getByRole("link", {
      name: /View Annual Reports/i,
    });
    expect(submitTitleLink).toBeVisible();
    expect(submitTitleLink).toHaveAttribute("href", "/reporting/operations");
    const pastTitleLink = screen.getByRole("link", {
      name: /View Past Submissions/i,
    });
    expect(pastTitleLink).toBeVisible();
    expect(pastTitleLink).toHaveAttribute("href", "/reporting/tbd");
  });
});
