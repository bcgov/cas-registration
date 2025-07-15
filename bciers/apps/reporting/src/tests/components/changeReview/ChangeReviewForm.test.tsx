import { useRouter } from "@bciers/testConfig/mocks";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ChangeReviewForm from "@reporting/src/app/components/changeReview/ChangeReviewForm";
import { actionHandler } from "@bciers/actions";
import { HeaderStep } from "@reporting/src/app/components/taskList/types";

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("@bciers/components/form/MultiStepWrapperWithTaskList", () => ({
  default: ({
    children,
    onSubmit,
    errors,
    isRedirecting,
    noSaveButton,
  }: any) => (
    <div data-testid="multi-step-wrapper">
      {children}
      <button
        onClick={onSubmit}
        data-testid="submit-button"
        disabled={isRedirecting}
      >
        {isRedirecting ? "Saving..." : "Save & Continue"}
      </button>
      {errors && (
        <div data-testid="errors">
          {errors.map((error: string, idx: number) => (
            <div key={idx} data-testid={`error-${idx}`}>
              {error}
            </div>
          ))}
        </div>
      )}
      {isRedirecting && <div data-testid="redirecting">Redirecting...</div>}
      <div data-testid="no-save-button">{noSaveButton ? "true" : "false"}</div>
    </div>
  ),
}));

vi.mock(
  "@reporting/src/app/components/changeReview/templates/ReviewChanges",
  () => ({
    default: ({ changes }: any) => (
      <div data-testid="review-changes">
        Changes count: {changes.length}
        {changes.map((change: any, idx: number) => (
          <div key={idx} data-testid={`change-${idx}`}>
            {change.field}: {change.old_value} → {change.new_value}
          </div>
        ))}
      </div>
    ),
  }),
);
vi.mock(
  "@reporting/src/app/components/changeReview/templates/facilityReportParser",
  async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
      ...actual,
      detectActivityChangesInModifiedFacility: vi.fn(() => ({
        facilityName: "Mock Facility",
        addedActivities: [],
        removedActivities: [],
      })),
    };
  },
);
vi.mock("@bciers/components/form", () => ({
  FormBase: ({ onChange, formData, children, className }: any) => (
    <div data-testid="form-base" className={className}>
      <input
        data-testid="form-input"
        onChange={(e) => onChange({ formData: { test: e.target.value } })}
        value={formData?.test || ""}
      />
      {children}
    </div>
  ),
}));

vi.mock("@reporting/src/data/jsonSchema/changeReview/changeReview", () => ({
  changeReviewSchema: { type: "object", properties: {} },
  changeReviewUiSchema: {},
}));

describe("The ChangeReviewForm component", () => {
  const mockActionHandler = actionHandler as vi.MockedFunction<
    typeof actionHandler
  >;

  const defaultProps = {
    versionId: 123,
    initialFormData: { test: "initial" },
    navigationInformation: {
      headerStepIndex: 1,
      headerSteps: [
        HeaderStep.OperationInformation,
        HeaderStep.ReportInformation,
        HeaderStep.EmissionsData,
        HeaderStep.AdditionalInformation,
        HeaderStep.ComplianceSummary,
        HeaderStep.SignOffSubmit,
      ],
      taskList: [
        {
          type: "Section" as const,
          title: "Operation Information",
          isChecked: true,
          isExpanded: false,
          isActive: false,
        },
        {
          type: "Section" as const,
          title: "Report Information",
          isChecked: true,
          isExpanded: false,
          isActive: false,
        },
      ],
      backUrl: "/back",
      continueUrl: "/continue",
    },
    changes: [
      {
        field: "test_field",
        old_value: "old",
        new_value: "new",
        facilityName: "Mock Facility",
        deletedActivities: [],
        change_type: "modified",
      },
      {
        field: "another_field",
        old_value: "value1",
        new_value: "value2",
        facilityName: "Mock Facility",
        deletedActivities: [],
        change_type: "modified",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form with review changes and form base", () => {
    render(<ChangeReviewForm {...defaultProps} />);

    expect(screen.getByTestId("multi-step-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("review-changes")).toBeInTheDocument();
    expect(screen.getByTestId("form-base")).toBeInTheDocument();
    expect(screen.getByTestId("change-0")).toHaveTextContent(
      "test_field: old → new",
    );
    expect(screen.getByTestId("change-1")).toHaveTextContent(
      "another_field: value1 → value2",
    );
    expect(screen.getByText("Changes count: 2")).toBeInTheDocument();
  });

  it("updates form data when form changes", () => {
    render(<ChangeReviewForm {...defaultProps} />);

    const input = screen.getByTestId("form-input");

    expect(input).toHaveValue("initial");

    fireEvent.change(input, { target: { value: "updated" } });
    expect(input).toHaveValue("updated");
  });

  it("handles successful form submission", async () => {
    mockActionHandler.mockResolvedValue({ success: true });

    render(<ChangeReviewForm {...defaultProps} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockActionHandler).toHaveBeenCalledWith(
        "reporting/report-version/123",
        "POST",
        "reporting/report-version/123",
        {
          body: JSON.stringify(defaultProps.initialFormData),
        },
      );
      expect(mockRouterPush).toHaveBeenCalledWith("/continue");
    });
  });

  it("handles form submission error and displays error message", async () => {
    const errorMessage = "Submission failed";
    mockActionHandler.mockResolvedValue({ error: errorMessage });

    render(<ChangeReviewForm {...defaultProps} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockActionHandler).toHaveBeenCalled();
      expect(screen.getByTestId("errors")).toBeInTheDocument();
      expect(screen.getByTestId("error-0")).toHaveTextContent(errorMessage);
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    // Check that redirecting state is reset after error
    expect(screen.queryByTestId("redirecting")).not.toBeInTheDocument();
  });

  it("shows redirecting state during submission", async () => {
    mockActionHandler.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100),
        ),
    );

    render(<ChangeReviewForm {...defaultProps} />);

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    expect(screen.getByTestId("redirecting")).toBeInTheDocument();
    expect(submitButton).toHaveTextContent("Saving...");
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(mockRouterPush).toHaveBeenCalledWith("/continue");
    });
  });
});
