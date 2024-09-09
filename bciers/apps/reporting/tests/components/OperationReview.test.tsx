import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import OperationReview from "@reporting/src/app/components/operations/OperationReview";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = vi.fn();

describe("OperationReview Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    (actionHandler as unknown as typeof mockActionHandler) = mockActionHandler;
  });

  it("renders loading state initially", () => {
    render(
      <OperationReview
        formData={null}
        version_id={1}
        reportingYear={{
          reporting_year: 2024,
          report_due_date: "2024-12-31",
          reporting_window_end: "2024-12-31",
        }}
        allActivities={[]}
        allRegulatedProducts={[]}
      />,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
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

    // Wait for form data to load and check form fields
    await waitFor(() => {
      expect(screen.getByText("Operation Information")).toBeInTheDocument();
    });
  });
});
