import { render, screen } from "@testing-library/react";
import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import {
  actionHandler,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import {
  fetchOperationsPageData,
  getBusinessStructures,
  getNaicsCodes,
  getRegistrationPurposes,
  getRegulatedProducts,
  getReportingActivities,
} from "@/administration/tests/components/operations/mocks";

export const fetchFormEnums = () => {
  // Regulated products
  getRegulatedProducts.mockResolvedValueOnce([
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
  ]);
  // Operations
  fetchOperationsPageData.mockResolvedValueOnce([
    { id: "uuid1", name: "Operation 1" },
    { id: "uuid2", name: "Operation 2" },
    {
      id: "b974a7fc-ff63-41aa-9d57-509ebe2553a4",
      name: "Existing Operation",
    },
  ]);
  // Purposes
  getRegistrationPurposes.mockResolvedValueOnce([
    "Reporting Operation",
    "Potential Reporting Operation",
    "OBPS Regulated Operation",
    "Opted-in Operation",
    "New Entrant Operation",
    "Electricity Import Operation",
  ]);
  // Naics codes
  getNaicsCodes.mockResolvedValueOnce([
    {
      id: 1,
      naics_code: "211110",
      naics_description: "Oil and gas extraction (except oil sands)",
    },
    {
      id: 2,
      naics_code: "212114",
      naics_description: "Bituminous coal mining",
    },
  ]);
  // Reporting activities
  getReportingActivities.mockResolvedValueOnce([
    { id: 1, name: "Ammonia production" },
    { id: 2, name: "Cement production" },
  ]);
  // Business structures
  getBusinessStructures.mockResolvedValueOnce([
    { name: "General Partnership" },
    { name: "BC Corporation" },
  ]);
};

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationRegistrationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the Operation Information Form", async () => {
    fetchFormEnums();
    render(
      await OperationRegistrationPage({
        step: 1,
        // @ts-ignore
        operation: undefined, // the first step won't have an operation parameter because operation hasn't been selected yet
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
  });

  it("should render the Facility Information Form with 4 steps", async () => {
    useSearchParams.mockReturnValue({
      searchParams: {
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationsTitle: "Test Operation",
        step: 2,
      },
      get: vi.fn(),
    });
    actionHandler.mockReturnValue({
      items: [],
      count: 0,
    });
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "OBPS Regulated Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 2,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });

  it("should render 5 steps and the Opt-in Application Form if the registration purpose is Opt-in", async () => {
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "Opted-in Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Opt-In Application",
    );
  });

  it("should render 5 steps and the New Entrant Application Form if the registration purpose is New Entrant", async () => {
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "New Entrant Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );
  });

  it("should render the Operation Representative Form and 3 steps if the purpose is Electricity Import Operation", async () => {
    // purpose
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "Electricity Import Operation",
    });

    // contacts
    actionHandler.mockResolvedValueOnce({
      items: [],
      count: 0,
    });

    // existingOperationRepresentatives
    actionHandler.mockResolvedValueOnce([]);

    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 2,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });

  it("should render the Submission Form and 5 steps", async () => {
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "New Entrant Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 5,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
