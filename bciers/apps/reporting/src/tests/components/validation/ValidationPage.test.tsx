import { render } from "@testing-library/react";
import ValidationPage from "@reporting/src/app/components/validation/ValidationPage";
import ValidationForm from "@reporting/src/app/components/validation/ValidationForm";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { getReportValidationData } from "@reporting/src/app/utils/reportValidationForm/getReportValidationData";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";

// ---- mocks ----
vi.mock("@reporting/src/app/components/validation/ValidationForm", () => ({
  default: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportVerificationStatus", () => ({
  getReportVerificationStatus: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getIsSupplementaryReport", () => ({
  getIsSupplementaryReport: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/utils/reportValidationForm/getReportValidationData",
  () => ({
    getReportValidationData: vi.fn(),
  }),
);

// ---- typed mocks ----
const mockValidationForm = ValidationForm as ReturnType<typeof vi.fn>;
const mockGetReportVerificationStatus =
  getReportVerificationStatus as ReturnType<typeof vi.fn>;
const mockGetIsSupplementaryReport = getIsSupplementaryReport as ReturnType<
  typeof vi.fn
>;
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;
const mockGetReportValidationData = getReportValidationData as ReturnType<
  typeof vi.fn
>;

describe("ValidationPage", () => {
  it("renders the ValidationForm component with the correct data", async () => {
    const versionId = 123;

    const mockErrors = [
      {
        key: "missing_report_verification", // gitleaks:allow
        error: {
          severity: "Error",
          message: "Verification information must be completed.",
          context: {
            report_version_id: versionId,
          },
        },
      },
    ];

    mockGetIsSupplementaryReport.mockResolvedValue(false);
    mockGetReportVerificationStatus.mockResolvedValue({
      show_verification_page: true,
    });
    mockGetNavigationInformation.mockResolvedValue(dummyNavigationInformation);
    mockGetReportValidationData.mockResolvedValue({
      payload: { errors: mockErrors },
    });

    render(await ValidationPage({ version_id: versionId }));

    expect(mockValidationForm).toHaveBeenCalledWith(
      {
        navigationInformation: dummyNavigationInformation,
        validationErrors: mockErrors,
      },
      undefined,
    );
  });
});
