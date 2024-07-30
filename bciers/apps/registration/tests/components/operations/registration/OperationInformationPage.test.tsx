import { render, screen } from "@testing-library/react";
import OperationInformationPage from "apps/registration/app/components/operations/registration/OperationInformationPage";
import { useSession } from "@bciers/testConfig/mocks";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationInformationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the OperationInformationPage component", async () => {
    render(
      await OperationInformationPage({
        operation: "create",
        step: 2,
        steps: OperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
  });
});
