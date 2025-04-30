import { render, screen } from "@testing-library/react";

import HelpDrawer from "./HelpDrawer";
import userEvent from "@testing-library/user-event";

describe("Help drawer component", () => {
  it("should render hidden at first", () => {
    render(<HelpDrawer />);

    expect(screen.queryByRole("presentation")).toBeNull();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByText(/Getting started/i)).toBeNull();
  });

  it("should render menu after clicking the help button", async () => {
    render(<HelpDrawer />);

    await userEvent.click(screen.getByRole("button", { name: /help/i }));

    expect(screen.getByRole("heading", { name: /help/i })).toBeVisible();
    expect(screen.getByText("Getting Started")).toBeVisible();
  });

  it("should render the correct text", async () => {
    render(<HelpDrawer />);

    await userEvent.click(screen.getByRole("button", { name: /help/i }));

    expect(screen.getByText("BC OBPS overview")).toBeVisible();
    expect(screen.getByText("GGEAPAR")).toBeVisible();
    expect(
      screen.getByText("Greenhouse Gas Industrial Reporting and Control Act."),
    ).toBeVisible();
  });

  it("should redirect to the correct links", async () => {
    render(<HelpDrawer />);

    await userEvent.click(screen.getByRole("button", { name: /help/i }));

    const link1 = screen.getByRole("link", {
      name: /BC OBPS overview See detailed explanations on getting started/i,
    });
    expect(link1).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/bc-output-based-pricing-system",
    );
    const link2 = screen.getByRole("link", {
      name: /Guidance document See detailed guidance for getting started and reporting/i,
    });
    expect(link2).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/bc_obps_guidance.pdf",
    );
    const link3 = screen.getByRole("link", {
      name: /Process flow diagram and facility boundary map guidance/i,
    });
    expect(link3).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/assets/gov/environment/climate-change/ind/obps/guidance/boundary_map_guidance.pdf",
    );
    const link4 = screen.getByRole("link", {
      name: /WCI methodologies See detailed explanations of the Western Climate Initiative/i,
    });
    expect(link4).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/gov/content/environment/climate-change/industry/reporting/quantify",
    );
    const link5 = screen.getByRole("link", {
      name: /GGIRCA Greenhouse Gas Industrial Reporting and Control Act./i,
    });
    expect(link5).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01",
    );
    const link6 = screen.getByRole("link", {
      name: /GGERR Greenhouse Gas Emission Reporting Regulation./i,
    });
    expect(link6).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/249_2015",
    );
    const link7 = screen.getByRole("link", {
      name: /GGEAPAR Greenhouse Gas Emission Administrative Penalties and Appeals Regulation/i,
    });
    expect(link7).toHaveAttribute(
      "href",
      "https://www.bclaws.gov.bc.ca/civix/document/id/lc/statreg/248_2015",
    );
  });
});
