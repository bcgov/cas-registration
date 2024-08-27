import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import SelectOperatorPage from "../../../app/bceidbusiness/industry_user/select-operator/(request-access)/page";

import { useRouter, useSession } from "@bciers/testConfig/mocks";
import { Session } from "@bciers/testConfig/types";

const mockPush = vi.fn();
useRouter.mockReturnValue({
  push: mockPush,
});

describe("Select Operator Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page correctly ", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          full_name: "bc-cas-dev secondary",
          app_role: "industry_user",
        },
      },
    } as Session);
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
    // Verify the add operator button is available
    expect(screen.getByRole("link", { name: "Add Operator" })).toHaveAttribute(
      "href",
      "/select-operator/add-user-operator",
    );
  });
});
