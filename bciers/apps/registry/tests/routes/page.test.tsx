import { render, screen } from "@testing-library/react";
import RegistryPage from "apps/registry/app/page";

describe("Registry landing page", () => {
  it("renders the Registry heading and introduction", () => {
    render(<RegistryPage />);

    expect(screen.getByRole("heading", { name: "Registry" })).toBeVisible();
    expect(
      screen.getByText(
        "View and manage registry information for B.C. industrial operations.",
      ),
    ).toBeVisible();
  });
});
