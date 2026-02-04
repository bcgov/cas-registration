import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import OperationReviewForm from "@reporting/src/app/components/operations/OperationReviewForm";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { dummyNavigationInformation } from "../taskList/utils";
import { getUpdatedReportOperationDetails } from "@reporting/src/app/utils/getUpdatedReportOperationDetails";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getUpdatedReportOperationDetails", () => ({
  getUpdatedReportOperationDetails: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

const mockUseRouter = useRouter as vi.MockedFunction<typeof useRouter>;
const mockActionHandler = actionHandler as vi.MockedFunction<
  typeof actionHandler
>;
const mockGetUpdatedReportOperationDetails =
  getUpdatedReportOperationDetails as vi.MockedFunction<
    typeof getUpdatedReportOperationDetails
  >;
const mockGetNavigationInformation =
  getNavigationInformation as vi.MockedFunction<
    typeof getNavigationInformation
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
  { id: 1, name: "Activity 1", applicable_to: "all" },
  { id: 2, name: "Activity 2", applicable_to: "all" },
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

const reportType = "Simple Report";
const schema = buildOperationReviewSchema(
  formData,
  2024,
  activities,
  regulatedProducts,
  allRepresentatives,
  reportType,
  true,
  true,
  true,
  false, // isSyncAllowed
);

describe("OperationReviewForm Component", () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: vi.fn(), refresh: vi.fn() });
    mockActionHandler.mockResolvedValue(true); // Mock successful action handler
  });

  const renderForm = () => {
    render(
      <OperationReviewForm
        formData={formData}
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        schema={schema}
        applicableActivities={[]}
        allRegulatedProducts={[]}
        reportType={reportType}
        reportingYear={2024}
        facilityId={`1234`}
        allRepresentatives={allRepresentatives}
        isSyncAllowed={false}
      />,
    );
  };

  it("renders the form with the correct content", async () => {
    renderForm();

    await waitFor(() => {
      expect(
        screen.getByText("Review Operation Information"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please ensure this information was accurate for Dec 31st, 2024",
        ),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Back to All Reports/i)).toBeInTheDocument();
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
        expect(push).toHaveBeenCalledWith("continue");
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

    // Use data-testid to target the specific report type field
    const reportTypeField = screen.getByTestId("root_operation_report_type");
    const reportTypeSelect = reportTypeField.querySelector(
      'input[role="combobox"]',
    ) as HTMLElement;

    // Open the dropdown
    act(() => {
      reportTypeSelect.focus();
      fireEvent.mouseDown(reportTypeSelect);
    });

    // Wait for options to appear
    await waitFor(() => {
      const option = screen.getByRole("option", { name: "Annual Report" });
      expect(option).toBeVisible();
    });

    // Click on Annual Report option
    const annualReportOption = screen.getByRole("option", {
      name: "Annual Report",
    });
    await userEvent.click(annualReportOption);

    // Ensure the modal has been triggered by checking for its visibility.
    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to change your report type/i, {
          exact: false,
        }),
      ).toBeVisible();
    });

    expect(screen.getByText(/Confirmation/i)).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: /Change report type/i }),
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        `/reports/1234/review-operation-information`,
      );
    });
  });

  it("shows modal when switching report type and reverts report type when clicking cancel", async () => {
    renderForm();

    // Use data-testid to target the specific report type field
    const reportTypeField = screen.getByTestId("root_operation_report_type");
    const reportTypeSelect = reportTypeField.querySelector(
      'input[role="combobox"]',
    ) as HTMLElement;

    // Open the dropdown
    act(() => {
      reportTypeSelect.focus();
      fireEvent.mouseDown(reportTypeSelect);
    });

    // Wait for options to appear
    await waitFor(() => {
      const option = screen.getByRole("option", { name: "Annual Report" });
      expect(option).toBeVisible();
    });

    // Click on Annual Report option
    const annualReportOption = screen.getByRole("option", {
      name: "Annual Report",
    });
    await userEvent.click(annualReportOption);

    // Wait for modal to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to change your report type/i, {
          exact: false,
        }),
      ).toBeVisible();
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    // Wait for the modal to disappear after cancellation
    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to change your report type/i),
      ).not.toBeInTheDocument(); // Use not.toBeInTheDocument() for checking absence
    });

    const reportTypeFieldAfterCancel = screen.getByTestId(
      "root_operation_report_type",
    );
    const reportTypeSelectAfterCancel =
      reportTypeFieldAfterCancel.querySelector(
        'input[role="combobox"]',
      ) as HTMLInputElement;
    expect(reportTypeSelectAfterCancel).toHaveValue("Simple Report");
  });

  it("shows an error message when no operation representative exists", async () => {
    render(
      <OperationReviewForm
        formData={formData}
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        schema={schema}
        applicableActivities={[]}
        allRegulatedProducts={[]}
        reportType={reportType}
        reportingYear={2024}
        facilityId={`1234`}
        allRepresentatives={[]}
        isSyncAllowed={false}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Before you can continue,/, { exact: false }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/add an operation representative for this operation/i),
      ).toBeInTheDocument();
    });

    // The link should point to the admin operations page for the operation
    const link = screen
      .getByText(/add an operation representative for this operation/i)
      .closest("a");
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("/administration/operations/"),
    );
  });

  it("updates hasReps state and clears errors when syncing with representatives", async () => {
    mockGetUpdatedReportOperationDetails.mockResolvedValue({
      report_operation: formData,
      all_representatives: allRepresentatives,
      show_regulated_products: true,
      show_boro_id: true,
      show_activities: true,
    });
    mockGetNavigationInformation.mockResolvedValue(dummyNavigationInformation);

    // Create schema with isSyncAllowed=true to enable sync button
    const schemaWithSync = buildOperationReviewSchema(
      formData,
      2024,
      activities,
      regulatedProducts,
      allRepresentatives,
      reportType,
      true,
      true,
      true,
      true,
    );

    render(
      <OperationReviewForm
        formData={formData}
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        schema={schemaWithSync}
        applicableActivities={[]}
        allRegulatedProducts={[]}
        reportType={reportType}
        reportingYear={2024}
        facilityId={`1234`}
        allRepresentatives={[]}
        isSyncAllowed={true}
      />,
    );

    expect(
      screen.getByText(/Before you can continue,/, { exact: false }),
    ).toBeInTheDocument();

    const syncButton = screen.getByRole("button", {
      name: /Sync latest data from Administration/i,
    });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Before you can continue,/, { exact: false }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText(/Changes synced successfully/i),
      ).toBeInTheDocument();
    });
  });

  it("does not show sync button and info note when isSyncAllowed is false", async () => {
    render(
      <OperationReviewForm
        formData={formData}
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        schema={schema}
        applicableActivities={[]}
        allRegulatedProducts={[]}
        reportType={reportType}
        reportingYear={2024}
        facilityId={`1234`}
        allRepresentatives={allRepresentatives}
        isSyncAllowed={false}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Review Operation Information"),
      ).toBeInTheDocument();
    });

    // Verify sync button is not present
    const syncButton = screen.queryByRole("button", {
      name: /Sync latest data from Administration/i,
    });
    expect(syncButton).not.toBeInTheDocument();

    // Verify purpose note (info box) is not present
    expect(
      screen.queryByText(
        /Any edits to operation information made here will only apply to this report/i,
      ),
    ).not.toBeInTheDocument();
  });

  it("shows sync button and info note when isSyncAllowed is true", async () => {
    const schemaWithSync = buildOperationReviewSchema(
      formData,
      2024,
      activities,
      regulatedProducts,
      allRepresentatives,
      reportType,
      true,
      true,
      true,
      true,
    );

    render(
      <OperationReviewForm
        formData={formData}
        version_id={1}
        navigationInformation={dummyNavigationInformation}
        schema={schemaWithSync}
        applicableActivities={[]}
        allRegulatedProducts={[]}
        reportType={reportType}
        reportingYear={2024}
        facilityId={`1234`}
        allRepresentatives={allRepresentatives}
        isSyncAllowed={true}
      />,
    );

    await waitFor(() => {
      expect(
        screen.getByText("Review Operation Information"),
      ).toBeInTheDocument();
    });

    // Verify sync button is present
    const syncButton = screen.queryByRole("button", {
      name: /Sync latest data from Administration/i,
    });
    expect(syncButton).toBeInTheDocument();

    // Verify purpose note (info box) is present
    expect(
      screen.getByText(
        /Any edits to operation information made here will only apply to this report/i,
      ),
    ).toBeInTheDocument();
  });
});
