import { render, screen } from "@testing-library/react";
import { useSession } from "@bciers/testConfig/mocks";
import { actionHandler } from "@bciers/testConfig/mocks";
import { OperationRepresentativePage } from "@/registration/app/components/operations/registration";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const contactsMockResponse = {
  items: [
    {
      id: 1,
      first_name: "Henry",
      last_name: "Ives",
      email: "henry.ives@example.com",
    },
  ],
  count: 1,
};

const usersMockResponse = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    full_name: "Samantha Garcia",
  },
];

describe("the OperationRepresentativePage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the Operation Represenative Form", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce(contactsMockResponse);

    // users
    actionHandler.mockResolvedValueOnce(usersMockResponse);

    render(
      await OperationRepresentativePage({
        step: 5,
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });

  it("renders the appropriate error component when getUserOperatorUsers fails", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce(contactsMockResponse);

    // users
    actionHandler.mockResolvedValueOnce({ error: "oops!" });
    render(
      await OperationRepresentativePage({
        step: 5,
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(
      screen.getByText("Failed to Retrieve Contact or User Information"),
    ).toBeVisible();
  });

  it("renders the appropriate error component when getContacts fails", async () => {
    // contacts
    actionHandler.mockResolvedValueOnce({ error: "oops!" });

    // users
    actionHandler.mockResolvedValueOnce(usersMockResponse);
    // fetchFormEnums({ error: "oops!" });
    render(
      await OperationRepresentativePage({
        step: 5,
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        steps: allOperationRegistrationSteps,
      }),
    );

    expect(
      screen.getByText("Failed to Retrieve Contact or User Information"),
    ).toBeVisible();
  });
});
