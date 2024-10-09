import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { actionHandler } from "@bciers/actions";
import PersonResponsible from "@reporting/src/app/components/operations/personResponsible/PersonResponsible";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockPersonResponsibleData = {
  first_name: "John",
  last_name: "Doe",
};

describe("PersonResponsible", () => {
  it("should render with no contacts", async () => {
    const mockEmptyContactsData = {
      items: [],
      count: 0,
    };

    (actionHandler as Mock)
      .mockResolvedValueOnce(mockEmptyContactsData) // Mock empty contacts data
      .mockResolvedValueOnce(mockPersonResponsibleData); // Mock person responsible data

    render(<PersonResponsible version_id={1} />);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(2);
    });

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
  });

  it("renders the form correctly after loading", async () => {
    render(<PersonResponsible version_id={1} />);
    await waitFor(() => {
      expect(screen.getByText(/Save And Continue/i)).toBeInTheDocument();
    });
  });
});
