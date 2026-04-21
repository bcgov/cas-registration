import { render, screen } from "@testing-library/react";
import ValidationForm from "@reporting/src/app/components/validation/ValidationForm";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { ReportValidationErrors } from "@reporting/src/app/components/shared/validation/types";

// Mocks
vi.mock("@bciers/components/form/MultiStepWrapperWithTaskList", () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock(
  "@reporting/src/app/components/shared/validation/ReportValidationSummary",
  () => ({
    default: vi.fn(() => <div>Mock Validation Summary</div>),
  }),
);

const mockReportValidationSummary = ReportValidationSummary as ReturnType<
  typeof vi.fn
>;
const mockMultiStepWrapperWithTaskList =
  MultiStepWrapperWithTaskList as ReturnType<typeof vi.fn>;

const mockNavigationInformation = {
  headerSteps: [],
  headerStepIndex: 0,
  taskList: [],
  backUrl: "back",
  continueUrl: "continue",
} as any;

describe("ValidationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the validation summary when validation errors exist", () => {
    const validationErrors: ReportValidationErrors = [
      {
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Error",
          message: "Verification information must be completed.",
          context: {
            report_version_id: 123,
          },
        },
      },
    ];

    render(
      <ValidationForm
        navigationInformation={mockNavigationInformation}
        validationErrors={validationErrors}
      />,
    );

    expect(screen.getByText("Report validation")).toBeVisible();
    expect(screen.getByText("Mock Validation Summary")).toBeVisible();

    expect(mockReportValidationSummary).toHaveBeenCalledWith(
      { errors: validationErrors },
      undefined,
    );

    expect(mockMultiStepWrapperWithTaskList).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: mockNavigationInformation.headerSteps,
        initialStep: mockNavigationInformation.headerStepIndex,
        taskListElements: mockNavigationInformation.taskList,
        backUrl: mockNavigationInformation.backUrl,
        continueUrl: mockNavigationInformation.continueUrl,
        submittingButtonText: "Continue",
        noSaveButton: true,
      }),
      undefined,
    );
  });

  it("renders the success alert when there are no validation errors", () => {
    render(
      <ValidationForm
        navigationInformation={mockNavigationInformation}
        validationErrors={[]}
      />,
    );

    expect(screen.getByText("Report validation")).toBeVisible();
    expect(
      screen.getByText(/No issues were detected by the automated validation/i),
    ).toBeVisible();

    expect(mockReportValidationSummary).not.toHaveBeenCalled();
  });
});
