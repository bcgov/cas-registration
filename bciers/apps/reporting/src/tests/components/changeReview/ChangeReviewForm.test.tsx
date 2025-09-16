import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ChangeReviewForm from "@reporting/src/app/components/changeReview/ChangeReviewForm";
import { actionHandler } from "@bciers/actions";
import {
  HeaderStep,
  ReportingFlow,
} from "@reporting/src/app/components/taskList/types";

const mockRouterPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/changeReview/templates/ReviewChanges",
  () => ({
    ReviewChanges: vi.fn(() => <div>Mocked ReviewChanges</div>),
  }),
);

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
  "@reporting/src/app/components/changeReview/templates/ReasonForChange",
  () => ({
    default: ({ reasonForChange, onReasonChange, onSubmit }: any) => (
      <div data-testid="reason-for-change">
        <input
          data-testid="reason-input"
          value={reasonForChange}
          onChange={(e) => onReasonChange(e.target.value)}
        />
        <button data-testid="reason-submit" onClick={onSubmit}>
          Submit Reason
        </button>
      </div>
    ),
  }),
);

describe("ChangeReviewForm", () => {
  const mockActionHandler = actionHandler as vi.MockedFunction<
    typeof actionHandler
  >;

  const defaultProps = {
    versionId: 123,
    initialFormData: { test: "initial", reason_for_change: "" },
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
        oldValue: "old",
        newValue: "new",
        facilityName: "Mock Facility",
        deletedActivities: [],
        change_type: "modified",
      },
    ],
    flow: ReportingFlow.SFO,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates reason for change when input changes", () => {
    render(<ChangeReviewForm {...defaultProps} />);
    const reasonInput = screen.getByTestId("reason-input");
    fireEvent.change(reasonInput, { target: { value: "Updated reason" } });
    expect(reasonInput).toHaveValue("Updated reason");
  });

  it("handles successful submission", async () => {
    mockActionHandler.mockResolvedValue({ success: true });
    render(<ChangeReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => {
      expect(mockActionHandler).toHaveBeenCalledWith(
        "reporting/report-version/123",
        "POST",
        "reporting/report-version/123",
        expect.any(Object),
      );
      expect(mockRouterPush).toHaveBeenCalledWith("/continue");
    });
  });

  it("handles error submission", async () => {
    const errorMessage = "Submission failed";
    mockActionHandler.mockResolvedValue({ error: errorMessage });
    render(<ChangeReviewForm {...defaultProps} />);
    fireEvent.click(screen.getByTestId("submit-button"));
    await waitFor(() => {
      expect(screen.getByTestId("errors")).toBeInTheDocument();
      expect(screen.getByTestId("error-0")).toHaveTextContent(errorMessage);
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });
});
