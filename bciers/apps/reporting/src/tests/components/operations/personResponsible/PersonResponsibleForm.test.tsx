import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, Mock, it, expect } from "vitest";
import { actionHandler } from "@bciers/actions";
import PersonResponsibleForm from "@reporting/src/app/components/operations/personResponsible/PersonResponsibleForm";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockPersonResponsibleData = {
  first_name: "John",
  last_name: "Doe",
};
const mockContactsData = {
  items: [
    { id: 1, first_name: "John", last_name: "Doe" },
    { id: 2, first_name: "Jane", last_name: "Smith" },
  ],
  count: 2,
};

describe("PersonResponsibleForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders the form correctly after loading", async () => {
    render(<PersonResponsibleForm version_id={1} />);
    await waitFor(() => {
      expect(screen.getByText("Person Responsible")).toBeInTheDocument();
    });
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Save And Continue/i)).toBeInTheDocument();
  });

  it("should handle case where no matching contact is found", async () => {
    const mockContactsWithNoMatch = {
      items: [{ id: 2, first_name: "Jane", last_name: "Smith" }],
      count: 1,
    };

    (actionHandler as Mock)
      .mockResolvedValueOnce(mockContactsWithNoMatch)
      .mockResolvedValueOnce(mockPersonResponsibleData);

    render(<PersonResponsibleForm version_id={1} />);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(2);
    });
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();

    fireEvent.change(
      screen.getByLabelText("Select contact if they are already a BCIERS user"),
      {
        target: { value: "" },
      },
    );
    expect(screen.queryByDisplayValue("John Doe")).not.toBeInTheDocument();
  });

  it("should update schema and form data when contact is selected", async () => {
    (actionHandler as Mock)
      .mockResolvedValueOnce(mockContactsData)
      .mockResolvedValueOnce(mockPersonResponsibleData)
      .mockResolvedValueOnce({});

    render(<PersonResponsibleForm version_id={1} />);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(3);
    });

    const selectElement = screen.getByLabelText(
      "Select contact if they are already a BCIERS user",
    );

    fireEvent.change(selectElement, { target: { value: "Jane Smith" } });

    await waitFor(() => {
      expect(screen.getByDisplayValue("Jane Smith")).toBeInTheDocument();
    });
  });
});
