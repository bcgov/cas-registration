import { render, screen } from "@testing-library/react";
import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import {
  actionHandler,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";

export const fetchFormEnums = () => {
  // Regulated products
  actionHandler.mockResolvedValueOnce([
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
  ]);
  // Operations
  actionHandler.mockResolvedValueOnce([
    { id: 1, name: "Operation 1" },
    { id: 2, name: "Operation 2" },
  ]);
  // Purposes
  actionHandler.mockResolvedValueOnce([
    "New Entrant Application",
    "Potential Reporting Operation",
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

  it("should render the Facility Information Form", async () => {
    useSearchParams.mockReturnValue({
      searchParams: {
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationsTitle: "Test Operation",
        step: 3,
      },
      get: vi.fn(),
    });
    actionHandler.mockReturnValue({
      items: [],
      count: 0,
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

  // add tests for new entrant and opt-in pages when created

  it("should render the Operation Representative Form", async () => {
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });

  it("should render the Submission Form", async () => {
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 4,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
