import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { getContacts } from "@bciers/actions/api";
import PersonResponsible from "@reporting/src/app/components/operations/personResponsible/PersonResponsible";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("@bciers/actions/api", () => ({
  getContacts: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = actionHandler as typeof vi.fn;

const mockContactsResponse = {
  items: [
    { id: 1, first_name: "John", last_name: "Doe" },
    { id: 2, first_name: "Jane", last_name: "Smith" },
  ],
  count: 2,
};

describe("PersonResponsible Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockActionHandler.mockClear();
    (getContacts as vi.Mock).mockResolvedValue(mockContactsResponse);
  });

  it("renders the form correctly after loading", async () => {
    render(<PersonResponsible version_id={1} />);

    // Wait for contacts to load and form to render
    await waitFor(() => {
      expect(screen.getByText("Person Responsible")).toBeInTheDocument();
    });

    // Check that form elements exist
    expect(screen.getByRole("button", { name: /Cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save And Continue/i }),
    ).toBeInTheDocument();
  });
});
