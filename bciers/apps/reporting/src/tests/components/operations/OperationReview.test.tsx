import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import OperationReview from "@reporting/src/app/components/operations/OperationReview";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useRouter: vi.fn(),
    useSearchParams: vi.fn(() => new URLSearchParams()),
  };
});

const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = vi.fn();

describe("OperationReview Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    (actionHandler as unknown as typeof mockActionHandler) = mockActionHandler;
  });

  it("renders the form correctly after loading", async () => {
    render(
      <OperationReview
        formData={{
          activities: [1],
          regulated_products: [1],
          operation_representative_name: "John Doe",
          operation_type: "Test Operation",
        }}
        version_id={1}
        reportingYear={{
          reporting_year: 2024,
          report_due_date: "2024-12-31",
          reporting_window_end: "2024-12-31",
        }}
        allActivities={[{ id: 1, name: "Activity 1" }]}
        allRegulatedProducts={[{ id: 1, name: "Product 1" }]}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Operation Information")).toBeInTheDocument();
    });
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Save And Continue/i)).toBeInTheDocument();
  });
});
