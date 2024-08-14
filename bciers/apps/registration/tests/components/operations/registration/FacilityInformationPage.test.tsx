import { render, screen } from "@testing-library/react";
import FacilityInformationPage from "apps/registration/app/components/operations/registration/FacilityInformationPage";
import { useSession } from "@bciers/testConfig/mocks";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

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
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        searchParams: {},
        step: 2,
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Facility Information",
    );
  });
});
