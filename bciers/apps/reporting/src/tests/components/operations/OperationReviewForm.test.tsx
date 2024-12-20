import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import OperationReviewForm from "@reporting/src/app/components/operations/OperationReviewForm";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = actionHandler as vi.MockedFunction<
  typeof actionHandler
>;

const defaultProps = {
  formData: {
    activities: [1],
    regulated_products: [1],
    operation_representative_name: [4],
    operation_type: "Test Operation",
  },
  version_id: 1,
  reportType: { report_type: "Annual Report" },
  reportingYear: {
    reporting_year: 2024,
    report_due_date: "2024-12-31",
    reporting_window_end: "2024-12-31",
  },
  allActivities: [{ id: 1, name: "Activity 1" }],
  allRegulatedProducts: [{ id: 1, name: "Product 1" }],
  registrationPurpose: "Test Purpose",
  facilityReport: {
    facility_id: 2344,
    operation_type: "Single Facility Operation",
  },
  allRepresentatives: [{ id: 4, representative_name: "Shon Doe" }],
};

describe("OperationReviewForm Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockActionHandler.mockResolvedValue(true); // Mock successful action handler
  });

  const renderForm = (overrideProps = {}) =>
    render(<OperationReviewForm {...defaultProps} {...overrideProps} />);

  it("renders the form with the correct content", async () => {
    renderForm();

    await waitFor(() => {
      expect(
        screen.getByText("Review operation information"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Save & Continue/i)).toBeInTheDocument();
  });

  it(
    "submits the form and navigates to the next page",
    { timeout: 10000 },
    async () => {
      const { push } = useRouter();

      renderForm({
        formData: {
          ...defaultProps.formData,
          operation_name: "Operation Name",
          operation_bcghgid: "your-bcghg-id",
        },
      });

      // Simulate form submission
      fireEvent.click(screen.getByText(/Save & Continue/i));

      await waitFor(() => {
        expect(mockActionHandler).toHaveBeenCalledWith(
          expect.stringContaining(
            "reporting/report-version/1/report-operation",
          ),
          expect.any(String),
          expect.any(String),
          expect.objectContaining({
            body: expect.any(String),
          }),
        );
        expect(push).toHaveBeenCalledWith("/reports/1/person-responsible");
      });
    },
  );

  it("displays helper text for Simple Report", async () => {
    renderForm({
      formData: {
        ...defaultProps.formData,
        operation_report_type: "Simple Report",
      },
      reportType: { report_type: "Simple Report" },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /Simple Reports are submitted by reporting operations/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
