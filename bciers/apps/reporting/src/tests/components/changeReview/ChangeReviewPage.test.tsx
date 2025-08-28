import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import ChangeReviewPage from "@reporting/src/app/components/changeReview/ChangeReviewPage";
import { getReportVersionDetails } from "@reporting/src/app/utils/getReportVersionDetails";
import { getChangeReviewData } from "@reporting/src/app/utils/getReviewChangesData";
import { getIsSupplementaryReport } from "@reporting/src/app/utils/getIsSupplementaryReport";
import { getReportVerificationStatus } from "@reporting/src/app/utils/getReportVerificationStatus";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";

// Mock all the async utility functions
vi.mock("@reporting/src/app/utils/getReportVersionDetails", () => ({
  getReportVersionDetails: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReviewChangesData", () => ({
  getChangeReviewData: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getIsSupplementaryReport", () => ({
  getIsSupplementaryReport: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getReportVerificationStatus", () => ({
  getReportVerificationStatus: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

vi.mock("@reporting/src/app/components/changeReview/ChangeReviewForm", () => ({
  default: (props: any) => (
    <div data-testid="change-review-form">
      <div data-testid="version-id">{props.versionId}</div>
      <div data-testid="changes-count">{props.changes?.length || 0}</div>
      <div data-testid="initial-form-data">
        {JSON.stringify(props.initialFormData)}
      </div>
      <div data-testid="navigation-info">
        Step {props.navigationInformation.headerStepIndex} of{" "}
        {props.navigationInformation.headerSteps.length}
      </div>
      <div data-testid="back-url">{props.navigationInformation.backUrl}</div>
      <div data-testid="continue-url">
        {props.navigationInformation.continueUrl}
      </div>
    </div>
  ),
}));

describe("The ChangeReviewPage component", () => {
  const mockGetReportVersionDetails =
    getReportVersionDetails as vi.MockedFunction<
      typeof getReportVersionDetails
    >;
  const mockGetChangeReviewData = getChangeReviewData as vi.MockedFunction<
    typeof getChangeReviewData
  >;
  const mockGetIsSupplementaryReport =
    getIsSupplementaryReport as vi.MockedFunction<
      typeof getIsSupplementaryReport
    >;
  const mockGetReportVerificationStatus =
    getReportVerificationStatus as vi.MockedFunction<
      typeof getReportVerificationStatus
    >;
  const mockGetNavigationInformation =
    getNavigationInformation as vi.MockedFunction<
      typeof getNavigationInformation
    >;

  const mockFormData = { reportId: 123, status: "draft", operatorId: 1 };
  const mockChanges = [
    {
      field: "test_field",
      old_value: "old",
      new_value: "new",
      change_type: "modified",
    },
    {
      field: "another_field",
      old_value: "value1",
      new_value: "value2",
      change_type: "modified",
    },
  ];
  const mockNavigationInfo = {
    headerStepIndex: 4,
    headerSteps: [
      "Operation Info",
      "Facility Reports",
      "Summary",
      "Review",
      "Sign Off",
    ],
    taskList: [
      {
        type: "Section",
        title: "Sign Off & Submit",
        isExpanded: true,
        elements: [],
      },
    ],
    backUrl: "/reporting/123/summary",
    continueUrl: "/reporting/123/sign-off",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReportVersionDetails.mockResolvedValue(mockFormData);
    mockGetChangeReviewData.mockResolvedValue({ changed: mockChanges });
    mockGetIsSupplementaryReport.mockResolvedValue(true);
    mockGetReportVerificationStatus.mockResolvedValue({
      show_verification_page: true,
    });
    mockGetNavigationInformation.mockResolvedValue(mockNavigationInfo);
  });

  it("renders ChangeReviewForm with correct props for supplementary report with verification", async () => {
    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 123,
    });
    render(ChangeReviewPageComponent);

    expect(screen.getByTestId("change-review-form")).toBeInTheDocument();
    expect(screen.getByTestId("version-id")).toHaveTextContent("123");
    expect(screen.getByTestId("changes-count")).toHaveTextContent("2");
    expect(screen.getByTestId("initial-form-data")).toHaveTextContent(
      JSON.stringify(mockFormData),
    );
    expect(screen.getByTestId("navigation-info")).toHaveTextContent(
      "Step 4 of 5",
    );
    expect(screen.getByTestId("back-url")).toHaveTextContent(
      "/reporting/123/summary",
    );
    expect(screen.getByTestId("continue-url")).toHaveTextContent(
      "/reporting/123/sign-off",
    );

    // Verify all utility functions were called with correct parameters
    await waitFor(() => {
      expect(mockGetReportVersionDetails).toHaveBeenCalledWith(123);
      expect(mockGetChangeReviewData).toHaveBeenCalledWith(123);
      expect(mockGetIsSupplementaryReport).toHaveBeenCalledWith(123);
      expect(mockGetReportVerificationStatus).toHaveBeenCalledWith(123);
      expect(mockGetNavigationInformation).toHaveBeenCalledWith(
        "Sign-off & Submit", // HeaderStep.SignOffSubmit
        "ChangeReview", // ReportingPage.ChangeReview
        123,
        "",
        {
          skipVerification: false,
          skipChangeReview: false,
        },
      );
    });
  });

  it("handles non-supplementary report (skips change review)", async () => {
    mockGetIsSupplementaryReport.mockResolvedValue(false);

    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 456,
    });
    render(ChangeReviewPageComponent);

    await waitFor(() => {
      expect(mockGetNavigationInformation).toHaveBeenCalledWith(
        "Sign-off & Submit", // HeaderStep.SignOffSubmit
        "ChangeReview", // ReportingPage.ChangeReview
        456,
        "",
        {
          skipVerification: false,
          skipChangeReview: true,
        },
      );
    });
  });

  it("handles report without verification (skips verification)", async () => {
    mockGetReportVerificationStatus.mockResolvedValue({
      show_verification_page: false,
    });

    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 789,
    });
    render(ChangeReviewPageComponent);

    await waitFor(() => {
      expect(mockGetNavigationInformation).toHaveBeenCalledWith(
        "Sign-off & Submit", // HeaderStep.SignOffSubmit
        "ChangeReview", // ReportingPage.ChangeReview
        789,
        "",
        {
          skipVerification: true,
          skipChangeReview: false,
        },
      );
    });
  });

  it("handles empty changes data", async () => {
    mockGetChangeReviewData.mockResolvedValue({ changed: [] });

    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 999,
    });
    render(ChangeReviewPageComponent);

    expect(screen.getByTestId("changes-count")).toHaveTextContent("0");
    await waitFor(() => {
      expect(mockGetChangeReviewData).toHaveBeenCalledWith(999);
    });
  });

  it("handles error in data fetching gracefully", async () => {
    mockGetReportVersionDetails.mockRejectedValue(new Error("Failed to fetch"));

    await expect(ChangeReviewPage({ version_id: 123 })).rejects.toThrow(
      "Failed to fetch",
    );
  });

  it("passes correct navigation options for non-supplementary report without verification", async () => {
    mockGetIsSupplementaryReport.mockResolvedValue(false);
    mockGetReportVerificationStatus.mockResolvedValue({
      show_verification_page: false,
    });

    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 555,
    });
    render(ChangeReviewPageComponent);

    await waitFor(() => {
      expect(mockGetNavigationInformation).toHaveBeenCalledWith(
        "Sign-off & Submit", // HeaderStep.SignOffSubmit
        "ChangeReview", // ReportingPage.ChangeReview
        555,
        "",
        {
          skipVerification: true,
          skipChangeReview: true,
        },
      );
    });
  });

  it("passes custom navigation information correctly to ChangeReviewForm", async () => {
    const customNavigationInfo = {
      headerStepIndex: 3,
      headerSteps: [
        "Custom Step 1",
        "Custom Step 2",
        "Custom Step 3",
        "Custom Step 4",
      ],
      taskList: [{ type: "Page", title: "Custom Task" }],
      backUrl: "/custom-back",
      continueUrl: "/custom-continue",
    };
    mockGetNavigationInformation.mockResolvedValue(customNavigationInfo);

    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 777,
    });
    render(ChangeReviewPageComponent);

    expect(screen.getByTestId("navigation-info")).toHaveTextContent(
      "Step 3 of 4",
    );
    expect(screen.getByTestId("back-url")).toHaveTextContent("/custom-back");
    expect(screen.getByTestId("continue-url")).toHaveTextContent(
      "/custom-continue",
    );
  });

  it("calls all required data fetching functions in correct order", async () => {
    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 123,
    });
    render(ChangeReviewPageComponent);

    // Verify the order and calls of all data fetching functions
    expect(mockGetReportVersionDetails).toHaveBeenCalledTimes(1);
    expect(mockGetChangeReviewData).toHaveBeenCalledTimes(1);
    expect(mockGetIsSupplementaryReport).toHaveBeenCalledTimes(1);
    expect(mockGetReportVerificationStatus).toHaveBeenCalledTimes(1);
    expect(mockGetNavigationInformation).toHaveBeenCalledTimes(1);
  });

  it("handles complex form data correctly", async () => {
    const complexFormData = {
      reportId: 123,
      status: "draft",
      operatorId: 1,
      facilityReports: [
        { facilityId: 1, name: "Facility 1" },
        { facilityId: 2, name: "Facility 2" },
      ],
      compliance: { status: "compliant" },
    };
    mockGetReportVersionDetails.mockResolvedValue(complexFormData);

    const ChangeReviewPageComponent = await ChangeReviewPage({
      version_id: 123,
    });
    render(ChangeReviewPageComponent);

    expect(screen.getByTestId("initial-form-data")).toHaveTextContent(
      JSON.stringify(complexFormData),
    );
  });
});
