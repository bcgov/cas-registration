import { describe, it, expect, vi } from "vitest";
import OperationReviewPage from "@reporting/src/app/components/operations/OperationReviewPage";
import OperationReviewForm from "@reporting/src/app/components/operations/OperationReviewForm";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { buildOperationReviewSchema } from "@reporting/src/data/jsonSchema/operations";
import {
  HeaderStep,
  ReportingPage,
} from "@reporting/src/app/components/taskList/types";
import { getReviewOperationInformationPageData } from "@reporting/src/app/utils/getReportOperationData";

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

vi.mock("@reporting/src/app/utils/getReportOperationData", () => ({
  getReviewOperationInformationPageData: vi.fn(),
}));

describe("OperationReviewPage", () => {
  it("renders OperationReviewForm with correct props", async () => {
    const reportVersion = { version_id: 1 };

    // Fake data returned by the mocks
    const fakeReportOperation = { foo: "bar" };
    const fakeFacilityReport = { facility_id: "facility-123" };
    const fakeNavigationInformation = { nav: "info" };
    const fakeParams = {
      report_operation: { op: "op" },
      reporting_year: "2024",
      all_activities: [{ id: 1, name: "Activity 1" }],
      all_regulated_products: [{ id: 10, name: "Product 1" }],
      all_representatives: [{ id: 100, representative_name: "Rep 1" }],
      report_type: { report_type: "Simple Report" },
      show_regulated_products: true,
      show_boro_id: false,
      show_activities: true,
      facility_id: "facility-123",
    };
    const fakeSchema = { schema: "my schema" };

    // Set up mock implementations
    (getReportingOperation as any).mockResolvedValue(fakeReportOperation);
    (getFacilityReport as any).mockResolvedValue(fakeFacilityReport);
    (getNavigationInformation as any).mockResolvedValue(
      fakeNavigationInformation,
    );
    (getReviewOperationInformationPageData as any).mockResolvedValue(
      fakeParams,
    );
    (buildOperationReviewSchema as any).mockReturnValue(fakeSchema);

    // Call the page
    const result = await OperationReviewPage(reportVersion);

    // Verify that the returned element is an OperationReviewForm with the expected props
    expect(result).toBeDefined();
    expect(result.type).toBe(OperationReviewForm);
    expect(result.props.formData).toEqual(fakeParams.report_operation);
    expect(result.props.version_id).toEqual(reportVersion.version_id);
    expect(result.props.schema).toEqual(fakeSchema);
    expect(result.props.navigationInformation).toEqual(
      fakeNavigationInformation,
    );

    // Verify that the dependent functions were called with the expected parameters
    expect(getNavigationInformation).toHaveBeenCalledWith(
      HeaderStep.OperationInformation,
      ReportingPage.ReviewOperationInfo,
      reportVersion.version_id,
      fakeParams.facility_id,
    );
    expect(getReviewOperationInformationPageData).toHaveBeenCalledWith(
      reportVersion.version_id,
    );
    expect(buildOperationReviewSchema).toHaveBeenCalledWith(
      fakeParams.report_operation,
      fakeParams.reporting_year,
      fakeParams.all_activities,
      fakeParams.all_regulated_products,
      fakeParams.all_representatives,
      fakeParams.report_type,
      fakeParams.show_regulated_products,
      fakeParams.show_boro_id,
      fakeParams.show_activities,
    );
  });
});
