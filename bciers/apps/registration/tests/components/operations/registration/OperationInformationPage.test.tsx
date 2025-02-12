import { render, screen } from "@testing-library/react";
import OperationInformationPage from "apps/registration/app/components/operations/registration/OperationInformationPage";
import { useSession } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import fetchFormEnums from "@bciers/testConfig/helpers/fetchFormEnums";
import { Apps } from "@bciers/utils/src/enums";

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
    fetchFormEnums(Apps.REGISTRATION);

    render(
      await OperationInformationPage({
        step: 1,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
  });
});
