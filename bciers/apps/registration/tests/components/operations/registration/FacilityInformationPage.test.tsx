import { render, screen } from "@testing-library/react";
import FacilityInformationPage from "apps/registration/app/components/operations/registration/FacilityInformationPage";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import {
  fetchFacilitiesPageData,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import { OperationTypes } from "@bciers/utils/src/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

useSearchParams.mockReturnValue({
  searchParams: {
    operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
    operations_title: "Test Operation",
    step: 3,
  },
  get: vi.fn(),
});

describe("the FacilityInformationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the FacilityInformationPage component", async () => {
    fetchFacilitiesPageData.mockReturnValueOnce({
      items: [],
      count: 0,
    });
    render(
      await FacilityInformationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationName: "Test Operation",
        operationType: OperationTypes.LFO,
        searchParams: {},
        step: 2,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );

    expect(
      screen.getByRole("button", { name: "Add facility" }),
    ).toBeInTheDocument();
  });

  it("should render the single facility operation form with name and type pre-populated", async () => {
    fetchFacilitiesPageData.mockReturnValueOnce({
      rows: [],
      row_count: 0,
    });
    const { container } = render(
      await FacilityInformationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationName: "Test Operation",
        operationType: OperationTypes.SFO,
        searchParams: {},
        step: 2,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );

    expect(
      screen.queryByRole("button", { name: "Add facility" }),
    ).not.toBeInTheDocument();

    const facilityName = container.querySelector("#root_section1_name");
    expect(facilityName).toHaveTextContent("Test Operation");

    const facilityType = container.querySelector("#root_section1_type");
    expect(facilityType).toHaveTextContent("Single Facility");
  });

  it("should render the datagrid with facility information", async () => {
    fetchFacilitiesPageData.mockReturnValueOnce({
      rows: [
        {
          id: "1",
          facility__name: "Test Facility 1",
          facility__type: "Test Facility Type 1",
          status: "Active",
        },
        {
          id: "2",
          facility__name: "Test Facility 2",
          facility__type: "Test Facility Type 2",
          status: "Active",
        },
      ],
      row_count: 1,
    });
    render(
      await FacilityInformationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationName: "Test Operation",
        operationType: OperationTypes.LFO,
        searchParams: {},
        step: 2,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByText("Test Facility 1")).toBeInTheDocument();
    expect(screen.getByText("Test Facility Type 1")).toBeInTheDocument();

    expect(screen.getByText("Test Facility 2")).toBeInTheDocument();
    expect(screen.getByText("Test Facility Type 2")).toBeInTheDocument();
  });

  it("should render the empty datagrid when there is no facility data", async () => {
    fetchFacilitiesPageData.mockReturnValueOnce({
      items: [],
      count: 0,
    });
    render(
      await FacilityInformationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationName: "Test Operation",
        operationType: OperationTypes.LFO,
        searchParams: {},
        step: 2,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByText("No records found")).toBeInTheDocument();
  });
});
