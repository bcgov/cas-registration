import { render, screen } from "@testing-library/react";
import { useSessionRole } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import OptedInOperationPage from "@/registration/app/components/operations/registration/OptedInOperationPage";

useSessionRole.mockReturnValue("industry_user_admin");

describe("the OptedInOperationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the OptedInOperationPage component", async () => {
    render(
      await OptedInOperationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Opt-In Application",
    );
  });
});
