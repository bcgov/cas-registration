import { getProductionData } from "@bciers/actions/api";
import ProductionDataPage from "@reporting/src/app/components/products/ProductionDataPage";
import { render, screen } from "@testing-library/react";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";
import { getReviewOperationInformationPageData } from "@reporting/src/app/utils/getReportOperationData";

vi.mock("@bciers/actions/api", () => ({
  getProductionData: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getReportInformationTaskListData", () => ({
  getReportInformationTasklist: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getOrderedActivities", () => ({
  getOrderedActivities: vi.fn().mockReturnValue([]),
}));
vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));
vi.mock("@reporting/src/app/utils/getFacilityReportDetails", () => ({
  getFacilityReportDetails: vi.fn().mockReturnValue([]),
}));
vi.mock("@reporting/src/app/utils/getReportOperationData", () => ({
  getReviewOperationInformationPageData: vi.fn(),
}));

const getProductionDataMock = getProductionData as ReturnType<typeof vi.fn>;

// 🏷 Constants
const props: HasFacilityId = {
  version_id: 1,
  facility_id: "abc",
};

const mockReportTaskList = {
  facilityName: "Test Facility",
  operationType: "SFO",
};
const mockReviewOperation = (optedOutFinalYear: number | undefined) => {
  (
    getReviewOperationInformationPageData as ReturnType<typeof vi.fn>
  ).mockResolvedValue({
    report_operation: {
      operation_opted_out_final_reporting_year: optedOutFinalYear,
    },
  });
};

describe("The Production Data component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({
      refresh: vi.fn(),
    });
    (getNavigationInformation as ReturnType<typeof vi.fn>).mockResolvedValue(
      dummyNavigationInformation,
    );

    // default: operation is NOT opted-out
    mockReviewOperation(undefined);
  });

  it("fetches the proper data and passes it to the form", async () => {
    (
      getReportInformationTasklist as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockReportTaskList);
    getProductionDataMock.mockReturnValue({
      report_data: {
        reporting_year: 2020,
      },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [],
        report_products: [],
      },
    });

    render(await ProductionDataPage(props));
    expect(getProductionData).toHaveBeenCalledWith(1, "abc");
  });

  it("renders the form with the right checkboxes", async () => {
    getProductionDataMock.mockReturnValue({
      report_data: {
        reporting_year: 2020,
      },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [
          { id: 123, name: "testProduct" },
          { id: 345, name: "otherProduct" },
        ],
        report_products: [],
      },
    });
    render(await ProductionDataPage(props));

    expect(screen.getAllByText(/production data/i)).toHaveLength(1);
    expect(
      screen.getByText("Select the products that apply to this facility:"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByText(/testProduct/)).toBeInTheDocument();
    expect(screen.getByText(/otherProduct/)).toBeInTheDocument();
  });
  it("renders the form with the right form elements except apr-dec production", async () => {
    getProductionDataMock.mockReturnValue({
      report_data: {
        reporting_year: 2020,
      },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [],
        report_products: [
          {
            product_name: "testProduct",
            unit: "tonnes of tests",
          },
        ],
      },
    });

    render(await ProductionDataPage(props));
    expect(screen.getByText("testProduct")).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
    expect(screen.getByText("tonnes of tests")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Production data for Apr 1 - Dec 31, 2024*"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Production Quantification Methodology*"),
    ).toHaveRole("combobox");
    expect(
      screen.getByLabelText(
        "Quantity in storage at the beginning of the compliance period [Jan 1], if applicable",
      ),
    ).toHaveRole("textbox");
    expect(
      screen.getByLabelText(
        "Quantity in storage at the end of the compliance period [Dec 31], if applicable",
      ),
    ).toHaveRole("textbox");
    expect(
      screen.getByLabelText(
        "Quantity sold during compliance period [Jan 1 - Dec 31], if applicable",
      ),
    ).toHaveRole("textbox");
    expect(
      screen.getByLabelText(
        "Quantity of throughput at point of sale during compliance period [Jan 1 - Dec 31], if applicable",
      ),
    ).toHaveRole("textbox");
  });

  it("displays the apr-dec field if the year is 2024", async () => {
    getProductionDataMock.mockReturnValue({
      report_data: {
        reporting_year: 2024,
      },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [],
        report_products: [
          {
            product_name: "testProduct",
            unit: "tonnes of tests",
          },
        ],
      },
    });

    render(await ProductionDataPage(props));
    expect(
      screen.getByLabelText("Production data for Apr 1 - Dec 31, 2024*"),
    ).toHaveRole("textbox");
  });

  it("displays the jan-mar field if the reporting year is 2025 and the operation has opted-out effective 2025", async () => {
    mockReviewOperation(2025);

    getProductionDataMock.mockReturnValue({
      report_data: {
        reporting_year: 2025,
      },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [],
        report_products: [
          {
            product_name: "testProduct",
            unit: "tonnes of tests",
          },
        ],
      },
    });

    render(await ProductionDataPage(props));

    expect(
      screen.getByLabelText("Production data for Jan 1 - Mar 31, 2025*"),
    ).toHaveRole("textbox");
  });

  it("calculates isOptedOut as false when reporting year is before opt-out year", async () => {
    mockReviewOperation(2025);

    getProductionDataMock.mockReturnValue({
      report_data: { reporting_year: 2024 },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [],
        report_products: [],
      },
    });

    render(await ProductionDataPage(props));

    expect(getReviewOperationInformationPageData).toHaveBeenCalledWith(1);
  });

  it("calculates isOptedOut as true when reporting year is equal to opt-out year", async () => {
    mockReviewOperation(2025); // final reporting year is 2025

    getProductionDataMock.mockReturnValue({
      report_data: { reporting_year: 2025 },
      facility_data: { facility_type: "SFO" },
      payload: {
        allowed_products: [],
        report_products: [],
      },
    });

    render(await ProductionDataPage(props));

    expect(getReviewOperationInformationPageData).toHaveBeenCalledWith(1);
  });
});
