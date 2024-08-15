import { render, screen } from "@testing-library/react";
import RegistrationSubmissionPage from "apps/registration/app/components/operations/registration/RegistrationSubmissionPage";
import { useSession } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

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
      RegistrationSubmissionPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 5,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
