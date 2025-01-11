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

describe("OperationReviewForm Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockActionHandler.mockResolvedValue(true); // Mock the action handler to always resolve successfully
  });

  it("renders the form correctly after loading", async () => {
    render(
      <OperationReviewForm
        formData={{
          activities: [1],
          regulated_products: [1],
          operation_representative_name: "John Doe",
          operation_type: "Test Operation",
        }}
        version_id={1}
        reportType={{ report_type: "Annual Report" }}
        reportingYear={{
          reporting_year: 2024,
          report_due_date: "2024-12-31",
          reporting_window_end: "2024-12-31",
        }}
        allActivities={[{ id: 1, name: "Activity 1" }]}
        allRegulatedProducts={[{ id: 1, name: "Product 1" }]}
        registrationPurpose="Test Purpose"
        facilityReport={{
          facility_id: "fake-guid",
          operation_type: "Single Facility Operation",
        }}
      />,
    );

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
    {
      timeout: 10000,
    },
    async () => {
      const { push } = useRouter();

      render(
        <OperationReviewForm
          formData={{
            activities: [1],
            regulated_products: [1],
            operation_representative_name: "John Doe",
            operation_bcghgid: "your-bcghg-id",
            operation_name: "Operation Name",
            operation_type: "Test Operation",
          }}
          version_id={1}
          reportType={{ report_type: "Annual Report" }}
          reportingYear={{
            reporting_year: 2024,
            report_due_date: "2024-12-31",
            reporting_window_end: "2024-12-31",
          }}
          allActivities={[{ id: 1, name: "Activity 1" }]}
          allRegulatedProducts={[{ id: 1, name: "Product 1" }]}
          registrationPurpose="Test Purpose"
          facilityReport={{
            facility_id: "fake-guid",
            operation_type: "Single Facility Operation",
          }}
        />,
      );

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

  it("shows helper text for Simple Report", async () => {
    render(
      <OperationReviewForm
        formData={{
          activities: [1],
          regulated_products: [1],
          operation_report_type: "Simple Report",
        }}
        version_id={1}
        reportType={{ report_type: "Simple Report" }}
        reportingYear={{
          reporting_year: 2024,
          report_due_date: "2024-12-31",
          reporting_window_end: "2024-12-31",
        }}
        allActivities={[{ id: 1, name: "Activity 1" }]}
        allRegulatedProducts={[{ id: 1, name: "Product 1" }]}
        registrationPurpose="Test Purpose"
        facilityReport={{
          facility_id: "fake-guid",
          operation_type: "Single Facility Operation",
        }}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          /Simple Reports are submitted by reporting operations/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows modal when switching report type and switches report type when accepting", async () => {
    render(
      <OperationReviewForm
        formData={{
          activities: [1],
          regulated_products: [1],
          operation_report_type: "Annual Report",
        }}
        version_id={1}
        reportType={{ report_type: "Annual Report" }}
        reportingYear={{
          reporting_year: 2024,
          report_due_date: "2024-12-31",
          reporting_window_end: "2024-12-31",
        }}
        allActivities={[{ id: 1, name: "Activity 1" }]}
        allRegulatedProducts={[{ id: 1, name: "Product 1" }]}
        registrationPurpose="Test Purpose"
        facilityReport={{
          facility_id: "fake-guid",
          operation_type: "Single Facility Operation",
        }}
      />,
    );

    const reportTypeSelect = screen.getByLabelText(
      /Select what type of report you are filling/i,
    );

    await waitFor(() => {
      fireEvent.change(reportTypeSelect, {
        target: { value: "Simple Report" },
      });
    });

    expect(
      screen.getByText(/Are you sure you want to change your report type/i),
    ).toBeVisible();
    expect(screen.getByText(/Change Report Type/i)).toBeVisible();

    await waitFor(() => {
      fireEvent.click(
        screen.getByRole("button", { name: "Change report type" }),
      );
    });

    expect(
      screen.queryByText(/Are you sure you want to change your report type/i),
    ).not.toBeVisible();
    expect(screen.getByText(/Simple Report/i)).toBeVisible();
    expect(screen.queryByText(/Annual Report/i)).not.toBeInTheDocument();
  });

  it("shows modal when switching report type and reverts report type when clicking cancel", async () => {
    render(
      <OperationReviewForm
        formData={{
          activities: [1],
          regulated_products: [1],
          operation_report_type: "Annual Report",
        }}
        version_id={1}
        reportType={{ report_type: "Annual Report" }}
        reportingYear={{
          reporting_year: 2024,
          report_due_date: "2024-12-31",
          reporting_window_end: "2024-12-31",
        }}
        allActivities={[{ id: 1, name: "Activity 1" }]}
        allRegulatedProducts={[{ id: 1, name: "Product 1" }]}
        registrationPurpose="Test Purpose"
        facilityReport={{
          facility_id: "fake-guid",
          operation_type: "Single Facility Operation",
        }}
      />,
    );

    const reportTypeSelect = screen.getByLabelText(
      /Select what type of report you are filling/i,
    );

    await waitFor(() => {
      fireEvent.change(reportTypeSelect, {
        target: { value: "Simple Report" },
      });
    });

    await waitFor(() => {
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    });

    expect(
      screen.queryByText(/Are you sure you want to change your report type/i),
    ).not.toBeVisible();
    expect(screen.queryByText(/Simple Report/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Annual Report/i)).toBeVisible();
  });
});
