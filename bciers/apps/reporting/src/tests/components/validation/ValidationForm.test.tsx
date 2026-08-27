import { render, screen } from "@testing-library/react";
import ValidationForm from "@reporting/src/app/components/validation/ValidationForm";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import {
  ValidationErrorSummary,
  ValidationItem,
} from "@bciers/components/validationErrors";
import { validationUIConfig } from "@reporting/src/app/components/validationErrors/config";
import type { ValidationMessageKey } from "@reporting/src/app/components/validationErrors/types";

// Mocks
vi.mock("@bciers/components/form/MultiStepWrapperWithTaskList", () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));

// Mock both named and default exports for the validationErrors module
vi.mock("@bciers/components/validationErrors", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("@bciers/components/validationErrors")
    >();
  return {
    ...actual,
    ValidationErrorSummary: vi.fn(() => <div>Mock Validation Summary</div>),
  };
});

const mockValidationErrorSummary = vi.mocked(ValidationErrorSummary);
const mockMultiStepWrapperWithTaskList = vi.mocked(
  MultiStepWrapperWithTaskList,
);

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
    const validationErrors: ValidationItem<ValidationMessageKey>[] = [
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

    expect(mockValidationErrorSummary).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: validationErrors,
        config: validationUIConfig,
      }),
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

    expect(mockValidationErrorSummary).not.toHaveBeenCalled();
  });
});
