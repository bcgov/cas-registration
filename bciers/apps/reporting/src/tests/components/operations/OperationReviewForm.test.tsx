import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import OperationReviewForm from "@reporting/src/app/components/operations/OperationReviewForm";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";

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

const formData = {
  operator_legal_name: "Bravo Technologies - has partner operator",
  operator_trade_name: "Bravo Technologies",
  operation_name: "Banana LFO - Registered",
  operation_type: "Linear Facility Operation",
  registration_purpose: "Test Purpose",
  operation_bcghgid: "23219990004",
  bc_obps_regulated_operation_id: "24-0015",
  activities: [1],
  regulated_products: [1],
  operation_representative_name: [69, 70],
  operation_report_type: "Simple Report",
};

const activities = [
  { id: 1, name: "Activity 1", applicable_to: "sfo" },
  { id: 2, name: "Activity 2", applicable_to: "sfo" },
];

const regulatedProducts = [
  { id: 1, name: "Product 1", unit: "BCRCT", is_regulated: true },
  {
    id: 2,
    name: "Product 2",
    unit: "Tonne cement equivalent",
    is_regulated: true,
  },
];

const allRepresentatives = [
  { id: 69, representative_name: "Bill Blue", selected_for_report: true },
  { id: 70, representative_name: "Bob Brown", selected_for_report: true },
];

const reportType = { report_type: "Simple Report" };
const schema = buildOperationReviewSchema(
  formData,
  "Dec 31 2025",
  activities,
  regulatedProducts,
  allRepresentatives,
  reportType,
  true,
);

describe("OperationReviewForm Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockActionHandler.mockResolvedValue(true); // Mock successful action handler
  });

  const renderForm = () => {
    render(
      <OperationReviewForm
        formData={formData}
        version_id={1}
        taskListElements={[]}
        schema={schema}
      />,
    );
  };

  it("renders the form with the correct content", async () => {
    renderForm();

    await waitFor(() => {
      expect(
        screen.getByText("Review Operation Information"),
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

      renderForm();

      // Simulate form submission
      fireEvent.click(screen.getByText(/Save & Continue/i));

      await waitFor(() => {
        expect(mockActionHandler).toHaveBeenCalledWith(
          expect.stringContaining(
            "reporting/report-version/1/report-operation",
          ),
          expect.any(String),
          expect.any(String),
          expect.objectContaining({ body: expect.any(String) }),
        );
        expect(push).toHaveBeenCalledWith("/reports/1/person-responsible");
      });
    },
  );

  it("displays helper text for Simple Report", async () => {
    renderForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Simple Reports are submitted by reporting operations/i,
          { exact: false },
        ),
      ).toBeInTheDocument();
    });
  });

  it("shows modal when switching report type and switches report type when accepting", async () => {
    mockActionHandler.mockResolvedValue(1234);
    const { push } = useRouter();

    renderForm();

    const reportTypeSelect = screen.getByLabelText(
      /Select what type of report you are filling/i,
    );

    fireEvent.change(reportTypeSelect, {
      target: { value: "Annual Report" },
    });

    // Ensure the modal has been triggered by checking for its visibility.
    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to change your report type/i),
      ).toBeVisible();
    });

    expect(screen.getByText(/Change Report Type/i)).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Change report type" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        "/reports/1234/review-operation-information",
      );
    });
  });

  it("shows modal when switching report type and reverts report type when clicking cancel", async () => {
    renderForm();

    fireEvent.change(
      screen.getByLabelText(/Select what type of report you are filling/i),
      {
        target: { value: "Annual Report" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Wait for the modal to disappear after cancellation
    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to change your report type/i),
      ).not.toBeInTheDocument(); // Use not.toBeInTheDocument() for checking absence
    });

    const reportTypeSelect = screen.getByLabelText(
      /Select what type of report you are filling/i,
    );
    expect(reportTypeSelect).toHaveValue("Simple Report");
  });
});
