import { getProductionData } from "@bciers/actions/api";
import ProductionDataPage from "@reporting/src/app/components/products/ProductionDataPage";
import { render, screen } from "@testing-library/react";
import { HasFacilityId } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import { getReportInformationTasklist } from "@reporting/src/app/utils/getReportInformationTaskListData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";

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
describe("The Production Data component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouter.mockReturnValue({
      refresh: vi.fn(),
    });
    (getNavigationInformation as ReturnType<typeof vi.fn>).mockResolvedValue(
      dummyNavigationInformation,
    );
  });

  it("fetches the proper data and passes it to the form", async () => {
    (
      getReportInformationTasklist as ReturnType<typeof vi.fn>
    ).mockResolvedValueOnce(mockReportTaskList);
    getProductionDataMock.mockReturnValue({
      allowed_products: [],
      report_products: [],
    });

    render(await ProductionDataPage(props));
    expect(getProductionData).toHaveBeenCalledWith(1, "abc");
  });

  it("renders the form with the right checkboxes", async () => {
    getProductionDataMock.mockReturnValue({
      allowed_products: [
        { id: 123, name: "testProduct" },
        { id: 345, name: "otherProduct" },
      ],
      report_products: [],
    });
    render(await ProductionDataPage(props));

    expect(screen.getAllByText(/production data/i)).toHaveLength(1);
    expect(
      screen.getByText("Products that apply to this facility"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.getByText(/testProduct/)).toBeInTheDocument();
    expect(screen.getByText(/otherProduct/)).toBeInTheDocument();
  });
  it("renders the form with the right form elements", async () => {
    getProductionDataMock.mockReturnValue({
      allowed_products: [],
      report_products: [
        {
          product_name: "testProduct",
          unit: "tonnes of tests",
        },
      ],
    });

    render(await ProductionDataPage(props));
    expect(screen.getByText("testProduct")).toBeInTheDocument();
    expect(screen.getByText("Unit")).toBeInTheDocument();
    expect(screen.getByText("tonnes of tests")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Production data for Apr 1 - Dec 31, 2024*"),
    ).toHaveRole("textbox");
    expect(
      screen.getByLabelText("Production Quantification Methodology*"),
    ).toHaveRole("textbox");
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
});
