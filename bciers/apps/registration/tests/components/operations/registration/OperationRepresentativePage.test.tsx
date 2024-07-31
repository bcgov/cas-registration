import { render, screen } from "@testing-library/react";
import OperationRepresentativePage from "apps/registration/app/components/operations/registration/OperationRepresentativePage";
import { useSession } from "@bciers/testConfig/mocks";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationRepresentativePage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the OperationRepresentativePage component", async () => {
    render(
      await OperationRepresentativePage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 4,
        steps: OperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });
});
