import { describe, it, expect, vi } from "vitest";
import OperationReviewPage from "@reporting/src/app/components/operations/OperationReviewPage";
import OperationReviewForm from "@reporting/src/app/components/operations/OperationReviewForm";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import { getOperationSchemaParameters } from "@reporting/src/app/components/operations/getOperationSchemaParameters";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";

// ✨ Mock the utility functions
vi.mock("@reporting/src/app/utils/getReportingOperation", () => ({
  getReportingOperation: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getFacilityReport", () => ({
  getFacilityReport: vi.fn(),
}));

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

vi.mock("@reporting/src/data/jsonSchema/operations", () => ({
  buildOperationReviewSchema: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/operations/getOperationSchemaParameters",
  () => ({
    getOperationSchemaParameters: vi.fn(),
  }),
);

describe("OperationReviewPage", () => {
  it("renders OperationReviewForm with correct props", async () => {
    const version_id = 1;

    // Fake data returned by the mocks
    const fakeReportOperation = { foo: "bar" };
    const fakeFacilityReport = { facility_id: "facility-123" };
    const fakeNavigationInformation = { nav: "info" };
    const fakeParams = {
      reportOperation: { op: "op" },
      reportingWindowEnd: "Dec 31 2025",
      allActivities: [{ id: 1, name: "Activity 1" }],
      allRegulatedProducts: [{ id: 10, name: "Product 1" }],
      allRepresentatives: [{ id: 100, representative_name: "Rep 1" }],
      reportType: { report_type: "Simple Report" },
      showRegulatedProducts: true,
      showBoroId: false,
    };
    const fakeSchema = { schema: "my schema" };

    // Set up mock implementations
    (getReportingOperation as any).mockResolvedValue(fakeReportOperation);
    (getFacilityReport as any).mockResolvedValue(fakeFacilityReport);
    (getNavigationInformation as any).mockResolvedValue(
      fakeNavigationInformation,
    );
    (getOperationSchemaParameters as any).mockResolvedValue(fakeParams);
    (buildOperationReviewSchema as any).mockReturnValue(fakeSchema);

    // Call the page
    const result = await OperationReviewPage({ version_id });

    // Verify that the returned element is an OperationReviewForm with the expected props
    expect(result).toBeDefined();
    expect(result.type).toBe(OperationReviewForm);
    expect(result.props.formData).toEqual(fakeReportOperation);
    expect(result.props.version_id).toEqual(version_id);
    expect(result.props.schema).toEqual(fakeSchema);
    expect(result.props.navigationInformation).toEqual(
      fakeNavigationInformation,
    );

    // Verify that the dependent functions were called with the expected parameters
    expect(getReportingOperation).toHaveBeenCalledWith(version_id);
    expect(getFacilityReport).toHaveBeenCalledWith(version_id);
    expect(getNavigationInformation).toHaveBeenCalledWith(
      HeaderStep.OperationInformation,
      ReportingPage.ReviewOperationInfo,
      version_id,
      fakeFacilityReport.facility_id,
    );
    expect(getOperationSchemaParameters).toHaveBeenCalledWith(version_id);
    expect(buildOperationReviewSchema).toHaveBeenCalledWith(
      fakeParams.reportOperation,
      fakeParams.reportingWindowEnd,
      fakeParams.allActivities,
      fakeParams.allRegulatedProducts,
      fakeParams.allRepresentatives,
      fakeParams.reportType,
      fakeParams.showRegulatedProducts,
      fakeParams.showBoroId,
    );
  });
});
