import { render, screen } from "@testing-library/react";
import NewEntrantOperationPage from "apps/registration/app/components/operations/registration/NewEntrantOperationPage";
import { useSession } from "@bciers/testConfig/mocks";
import { OperationRegistrationNewEntrantSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the NewEntrantOperationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the NewEntrantOperationPage component", async () => {
    render(
      await NewEntrantOperationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 4,
        steps: OperationRegistrationNewEntrantSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );
  });
});