import { render, screen } from "@testing-library/react";
import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import { auth } from "@bciers/testConfig/mocks";
import { useSession, useParams, useRouter } from "@bciers/testConfig/mocks";
import { QueryParams, Router } from "@bciers/testConfig/types";
import { actionHandler } from "@bciers/testConfig/mocks";

const fetchFormEnums = () => {
  // Regulated products
  actionHandler.mockResolvedValueOnce([
    { id: 1, name: "BC-specific refinery complexity throughput" },
    { id: 2, name: "Cement equivalent" },
  ]);
};

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

describe("the OperationRegistrationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("should render the OperationRegistrationPage component", async () => {
    auth.mockReturnValueOnce({
      user: { app_role: "industry_user_admin" },
    });
    useRouter.mockReturnValue({
      query: {
        formSection: "1",
        operation: "create",
      },
    } as Router);

    useParams.mockReturnValue({
      formSection: "1",
      operation: "create",
    } as QueryParams);
    fetchFormEnums();
    render(
      await OperationRegistrationPage({
        operation: "create",
        formSection: 1,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Registration Purpose",
    );
  });
});
