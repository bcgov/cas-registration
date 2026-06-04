import { getProductionData } from "@reporting/src/app/utils/productDataForm/getProductionData";
import ProductionDataPage from "@reporting/src/app/components/products/ProductionDataPage";
import { render, screen } from "@testing-library/react";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getOrderedActivities } from "@reporting/src/app/utils/getOrderedActivities";
import { getOverlappingIndustrialProcessEmissions } from "@reporting/src/app/utils/getOverlappingIndProcessEmissions";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";

vi.mock("@reporting/src/app/utils/productDataForm/getProductionData", () => ({
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
vi.mock("@reporting/src/app/utils/getOverlappingIndProcessEmissions", () => ({
  getOverlappingIndustrialProcessEmissions: vi.fn().mockReturnValue(0),
}));

const getProductionDataMock = getProductionData as ReturnType<typeof vi.fn>;
const getOrderedActivitiesMock = getOrderedActivities as ReturnType<
  typeof vi.fn
>;
const getOverlappingIndustrialProcessEmissionsMock =
  getOverlappingIndustrialProcessEmissions as ReturnType<typeof vi.fn>;

// 🏷 Constants
const props: HasFacilityId = {
  version_id: 1,
  facility_id: "abc",
};

const mockReportTaskList = {
  facilityName: "Test Facility",
  operationType: "SFO",
};

// Default mock return value for getProductionData
const defaultGetProductionDataMock = {
  report_data: {
    reporting_year: 2020,
  },
  facility_data: { facility_type: "SFO" },
  payload: {
    allowed_products: [],
    report_products: [],
    is_operation_opted_out: false,
  },
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
    getProductionDataMock.mockReturnValue(defaultGetProductionDataMock);
  });

  it("fetches the proper data and passes it to the form", async () => {
    (
      getReportInformationTasklist as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockReportTaskList);
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      report_data: {
        reporting_year: 2020,
      },
    });

    render(await ProductionDataPage(props));
    expect(getProductionData).toHaveBeenCalledWith(1, "abc");
  });

  it("renders the form with the right checkboxes", async () => {
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      report_data: {
        reporting_year: 2020,
      },
      payload: {
        allowed_products: [
          { id: 123, name: "testProduct" },
          { id: 345, name: "otherProduct" },
        ],
        report_products: [],
        is_operation_opted_out: false,
      },
    });
    render(await ProductionDataPage(props));

    expect(screen.getAllByText(/production data/i)).toHaveLength(1);
    expect(
      screen.getByText("Select the products that apply to this facility:"),
    ).toBeVisible();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByText(/testProduct/)).toBeVisible();
    expect(screen.getByText(/otherProduct/)).toBeVisible();
  });
  it("renders the form with the right form elements except apr-dec production", async () => {
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      report_data: {
        reporting_year: 2020,
      },
      payload: {
        allowed_products: [{ product_id: 123, name: "testProduct" }],
        report_products: [
          {
            product_id: 123,
            product_name: "testProduct",
            unit: "tonnes of tests",
          },
        ],
        is_operation_opted_out: false,
      },
    });

    render(await ProductionDataPage(props));
    expect(screen.getAllByText("testProduct")[0]).toBeVisible();
    expect(
      screen.queryByLabelText("Production data for Apr 1 - Dec 31, 2024*"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Production Quantification Methodology*"),
    ).toHaveRole("combobox");
    expect(screen.getByLabelText("annual_production")).toHaveRole("textbox");
    expect(screen.getByText("tonnes of tests")).toBeVisible();
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
      ...defaultGetProductionDataMock,
      report_data: {
        reporting_year: 2024,
      },
      payload: {
        allowed_products: [{ product_id: 123, name: "testProduct" }],
        report_products: [
          {
            product_name: "testProduct",
            unit: "tonnes of tests",
          },
        ],
        is_operation_opted_out: false,
      },
    });

    render(await ProductionDataPage(props));
    expect(
      screen.getByLabelText("Production data for Apr 1 - Dec 31, 2024*"),
    ).toHaveRole("textbox");
  });

  it("displays the jan-mar field if the reporting year is 2025 and the operation has opted-out effective 2025", async () => {
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      report_data: {
        reporting_year: 2025,
      },
      operation_data: {
        naics_code: "007",
        operation_type: "test",
        is_operation_opted_out: true,
      },
      payload: {
        allowed_products: [{ id: 123, name: "testProduct" }],
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
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      report_data: { reporting_year: 2024 },
      payload: {
        ...defaultGetProductionDataMock.payload,
        is_operation_opted_out: false,
      },
    });

    render(await ProductionDataPage(props));
  });

  it("calculates isOptedOut as true when reporting year is equal to opt-out year", async () => {
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      report_data: { reporting_year: 2025 },
      payload: {
        ...defaultGetProductionDataMock.payload,
        is_operation_opted_out: true,
      },
    });

    render(await ProductionDataPage(props));
  });

  it("calls getOverlappingIndustrialProcessEmissions when pulp_and_paper activity is found", async () => {
    getOrderedActivitiesMock.mockReturnValue([
      { id: 23, name: "Pulp and paper production", slug: "pulp_and_paper" },
    ]);
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      payload: {
        allowed_products: [],
        report_products: [],
        is_operation_opted_out: false,
      },
      operation_data: {
        naics_code: "322112",
      },
    });

    render(await ProductionDataPage(props));
    // getOverlappingIndustrialProcessEmissions is only called when isPulpAndPaper is set to true
    expect(getOverlappingIndustrialProcessEmissionsMock).toHaveBeenCalledWith(
      1,
      "abc",
    );
  });

  it("does not call getOverlappingIndustrialProcessEmissions when pulp_and_paper activity is not found", async () => {
    getOrderedActivitiesMock.mockReturnValue([
      { id: 1, name: "Other Activity", slug: "other_activity" },
    ]);
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      payload: {
        allowed_products: [],
        report_products: [],
        is_operation_opted_out: false,
      },
    });

    render(await ProductionDataPage(props));
    expect(getOverlappingIndustrialProcessEmissionsMock).not.toHaveBeenCalled();
  });

  it("does not call getOverlappingIndustrialProcessEmissions when no activities are found", async () => {
    getOrderedActivitiesMock.mockReturnValue([]);
    getProductionDataMock.mockReturnValue({
      ...defaultGetProductionDataMock,
      payload: {
        allowed_products: [],
        report_products: [],
        is_operation_opted_out: false,
      },
    });

    render(await ProductionDataPage(props));
    expect(getOverlappingIndustrialProcessEmissionsMock).not.toHaveBeenCalled();
  });
});
