import { render, screen } from "@testing-library/react";
import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import { useSession } from "@bciers/testConfig/mocks";
import { actionHandler } from "@bciers/testConfig/mocks";

const fetchFormEnums = () => {
  // Regulated products
  actionHandler.mockResolvedValueOnce([
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
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
  it("should render the Registration Purpose Form", async () => {
    fetchFormEnums();
    render(
      await OperationRegistrationPage({
        operation: "create",
        step: 1,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Registration Purpose",
    );
  });

  it("should render the Operation Information Form", async () => {
    render(
      await OperationRegistrationPage({
        operation: "create",
        step: 2,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
  });

  it("should render the Facility Information Form", async () => {
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });

  it("should render the New Entrant Form", async () => {
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 4,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );
  });

  it("should render the Operation Representative Form", async () => {
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 5,
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
        step: 6,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
