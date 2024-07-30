import { render, screen } from "@testing-library/react";
import RegistrationSubmissionPage from "apps/registration/app/components/operations/registration/RegistrationSubmissionPage";
import { useSession } from "@bciers/testConfig/mocks";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the RegistrationSubmissionPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the RegistrationSubmissionPage component", async () => {
    render(
      await RegistrationSubmissionPage({
        operation: "create",
        step: 5,
        steps: OperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
