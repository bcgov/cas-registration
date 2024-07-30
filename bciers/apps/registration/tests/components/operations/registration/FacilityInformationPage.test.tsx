import { render, screen } from "@testing-library/react";
import FacilityInformationPage from "apps/registration/app/components/operations/registration/FacilityInformationPage";
import { useSession } from "@bciers/testConfig/mocks";
import { OperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the FacilityInformationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the FacilityInformationPage component", async () => {
    render(
      await FacilityInformationPage({
        operation: "create",
        searchParams: {},
        step: 2,
        steps: OperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });
});
