import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import OperationReviewPage from "@reporting/src/app/components/operations/OperationReviewPage";
import { getAllActivities } from "@reporting/src/app/utils/getAllReportingActivities";
import { getReportingOperation } from "@reporting/src/app/utils/getReportingOperation";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";
import { getReportType } from "@reporting/src/app/utils/getReportType";
import { getRegulatedProducts } from "@bciers/actions/api";
import { getFacilityReport } from "@reporting/src/app/utils/getFacilityReport";
import { HasReportVersion } from "@reporting/src/app/utils//defaultPageFactoryTypes";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";

// ✨ Mock the utility functions
vi.mock("@reporting/src/app/utils/getAllReportingActivities", () => ({
  getAllActivities: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getReportingOperation", () => ({
  getReportingOperation: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getReportingYear", () => ({
  getReportingYear: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getReportType", () => ({
  getReportType: vi.fn(),
}));
vi.mock("@bciers/actions/api", () => ({
  getRegulatedProducts: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getFacilityReport", () => ({
  getFacilityReport: vi.fn(),
}));
vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

// 🏷 Constants
// Mock data for each function
const mockActivities = [{ id: 1, name: "Activity 1" }];
const mockRegulatedProducts = [{ id: 1, name: "Product 1" }];
const mockReportingYear = {
  reporting_year: 2024,
  report_due_date: "2024-12-31",
};
const mockReportType = { report_type: "Annual Report" };
const mockFacilityReport = {
  facility_id: 2344,
  operation_type: "Single Facility Operation",
};
const mockReportOperation = {
  report_operation: {
    operation_representative_name: [4],
    operation_type: "Test Operation",
    registration_purpose: "Test Purpose",
  },
  report_operation_representatives: [
    { id: 4, representative_name: "Shon Doe" },
  ],
};

const props: HasReportVersion = {
  version_id: 1,
};

describe("OperationReviewPage Component", () => {
  beforeEach(() => {
    // ✨ Mocking the responses of the utility functions
    (getAllActivities as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockActivities,
    );
    (getReportingOperation as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockReportOperation,
    );
    (getReportingYear as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockReportingYear,
    );
    (getReportType as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockReportType,
    );
    (getRegulatedProducts as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockRegulatedProducts,
    );
    (getFacilityReport as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFacilityReport,
    );
    (getNavigationInformation as ReturnType<typeof vi.fn>).mockResolvedValue(
      dummyNavigationInformation,
    );
    useRouter.mockReturnValue({
      refresh: vi.fn(),
    });
  });

  it("renders the form correctly with transformed props", async () => {
    render(await OperationReviewPage(props));

    await waitFor(() => {
      expect(getReportingOperation).toHaveBeenCalledWith(1);
      expect(getAllActivities).toHaveBeenCalled();
      expect(getRegulatedProducts).toHaveBeenCalled();
      expect(getReportingYear).toHaveBeenCalled();
      expect(getReportType).toHaveBeenCalledWith(1);
      expect(getFacilityReport).toHaveBeenCalledWith(1);
    });
    await waitFor(() => {
      expect(
        screen.getByText("Review Operation Information"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Back/i)).toBeInTheDocument();
    expect(screen.getByText(/Save & Continue/i)).toBeInTheDocument();
  });
});
