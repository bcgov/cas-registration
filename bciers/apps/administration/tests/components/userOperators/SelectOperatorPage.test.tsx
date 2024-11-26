import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import SelectOperatorPage from "apps/administration/app/bceidbusiness/industry_user/select-operator/(request-access)/page";

import { mockUseSession } from "@bciers/testConfig/helpers/mockUseSession";

describe("Select Operator Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the page correctly", async () => {
    // Mock the session data
    mockUseSession();
    // Render the SelectOperatorPage component
    render(<SelectOperatorPage />);
    // Verify the greeting
    expect(screen.getByText(/Hi,/)).toBeInTheDocument();
    expect(screen.getByText(/bc-cas-dev secondary!/)).toBeInTheDocument();
    // Verify the instructions
    expect(
      screen.getByText(/Which operator would you like to log in to?/),
    ).toBeInTheDocument();
    // Verify the form component is rendered
    expect(
      screen.getByText("Select Operator").closest("form"),
    ).toBeInTheDocument();
  });
});
