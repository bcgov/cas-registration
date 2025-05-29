import { render, screen } from "@testing-library/react";
import NewEntrantOperationPage from "apps/registration/app/components/operations/registration/NewEntrantOperationPage";
import { useSessionRole } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSessionRole.mockReturnValue("industry_user_admin");

describe("the NewEntrantOperationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the NewEntrantOperationPage component", async () => {
    render(
      await NewEntrantOperationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );
  });
});
