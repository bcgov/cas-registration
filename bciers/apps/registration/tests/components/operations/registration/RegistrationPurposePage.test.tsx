import { render, screen } from "@testing-library/react";
import RegistrationPurposePage from "apps/registration/app/components/operations/registration/RegistrationPurposePage";
import { useSession } from "@bciers/testConfig/mocks";
import { actionHandler } from "@bciers/testConfig/mocks";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

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

describe("the RegistrationPurposePage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the Registration Purpose Form", async () => {
    fetchFormEnums();
    render(
      await RegistrationPurposePage({
        operation: "create",
        step: 1,
        steps: OperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Registration Purpose",
    );
  });
});
