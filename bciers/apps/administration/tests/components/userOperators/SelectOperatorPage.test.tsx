import { fireEvent, render, screen } from "@testing-library/react";
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
    useSession.mockReturnValue({
      data: {
        user: {
          full_name: "bc-cas-dev secondary",
          app_role: "industry_user",
        },
      },
    } as Session);
  });

  it("renders the page correctly", async () => {
    render(<SelectOperatorPage />);
    // Verify the greeting
    expect(screen.getByText(/Hi,/)).toBeInTheDocument();
    expect(screen.getByText(/bc-cas-dev secondary!/)).toBeInTheDocument();
    // Verify the instructions
    expect(
      screen.getByText(/Which operator would you like to log in to?/),
    ).toBeInTheDocument();
    // Verify the radio buttons
    const legalNameRadio = screen.getByLabelText(
      /Search by Business Legal Name/i,
    );
    const craBusinessNumberRadio = screen.getByLabelText(
      /Search by Canada Revenue Agency \(CRA\) Business Number/i,
    );
    expect(legalNameRadio).toBeInTheDocument();
    expect(craBusinessNumberRadio).toBeInTheDocument();
    // Verify that the default search type selection is "legal_name"
    expect(legalNameRadio).toBeChecked();
    expect(craBusinessNumberRadio).not.toBeChecked();
    expect(
      screen.getByPlaceholderText("Enter Business Legal Name"),
    ).toBeInTheDocument();
    expect(screen.getByText("Select Operator")).toBeInTheDocument();
    // Verify the search_type radio button action
    fireEvent.click(craBusinessNumberRadio);
    expect(
      screen.getByPlaceholderText("Enter CRA Business Number"),
    ).toBeInTheDocument();
    expect(screen.getByText("Search Operator")).toBeInTheDocument();

    // Verify the add operator button is available
    expect(screen.getByRole("link", { name: "Add Operator" })).toHaveAttribute(
      "href",
      "/select-operator/add-user-operator",
    );
  });
});
