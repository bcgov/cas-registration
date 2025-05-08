import { render } from "@testing-library/react";

// Helper functions the page uses to fetch data
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getReportChange } from "@reporting/src/app/utils/getReportChange";

// Builds the navigationInformation object for the task list
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";

// The page under test and the form it should render
import ChangeReviewPage from "@reporting/src/app/components/changeReview/ChangeReviewPage";
import ChangeReviewForm from "@reporting/src/app/components/changeReview/ChangeReviewForm";

// A dummy nav info object we can return from our mock
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";

// MOCK SETUP

// Stub out the form component so we can verify its props only
vi.mock("@reporting/src/app/components/changeReview/ChangeReviewForm", () => ({
  default: vi.fn(),
}));

// Stub each data‑fetch helper so they don’t make real API calls
vi.mock("@reporting/src/app/utils/getReportChange", () => ({
  getReportChange: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getReportVerificationStatus", () => ({
  getReportVerificationStatus: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getIsSupplementaryReport", () => ({
  getIsSupplementaryReport: vi.fn(),
}));

// Stub the navigationInformation builder
vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

// References to mocks with proper typing
const mockChangeReviewForm = ChangeReviewForm as ReturnType<typeof vi.fn>;
const mockGetReportChange = getReportChange as ReturnType<typeof vi.fn>;
const mockGetReportVerificationStatus =
  getReportVerificationStatus as unknown as ReturnType<typeof vi.fn>;
const mockGetNavigationInformation = getNavigationInformation as ReturnType<
  typeof vi.fn
>;
const mockGetIsSupplementaryReport = getIsSupplementaryReport as ReturnType<
  typeof vi.fn
>;

// TEST SUITE
describe("ChangeReviewPage component", () => {
  it("renders the ChangeReviewForm component with the correct data", async () => {
    // --- Arrange ---
    // Inputs to our page
    const mockVersionId = 12345;
    const mockInitialFormData = { reason_or_change: "value1" };

    // Configure each helper to resolve with our fake data
    mockGetReportChange.mockResolvedValue(mockInitialFormData);
    mockGetReportVerificationStatus.mockResolvedValue({
      show_verification_page: true,
      verification_required: true,
    });
    mockGetIsSupplementaryReport.mockResolvedValue(false);
    mockGetNavigationInformation.mockResolvedValue(dummyNavigationInformation);

    // Act
    // Call and render the server component.
    // Because it's async, we await its return value.
    render(await ChangeReviewPage({ version_id: mockVersionId }));

    // Assert
    // Verify that ChangeReviewForm was invoked with the expected props
    expect(mockChangeReviewForm).toHaveBeenCalledWith(
      {
        versionId: mockVersionId,
        initialFormData: mockInitialFormData,
        navigationInformation: dummyNavigationInformation,
      },
      {}, // React may pass an empty context object as second arg
    );
  });
});
