import { render, screen } from "@testing-library/react";
import OperationRegistrationPage from "apps/registration/app/components/operations/OperationRegistrationPage";
import {
  actionHandler,
  useSearchParams,
  useSessionRole,
} from "@bciers/testConfig/mocks";
import fetchFormEnums from "@bciers/testConfig/helpers/fetchFormEnums";
import { Apps } from "@bciers/utils/src/enums";

useSessionRole.mockReturnValue("industry_user_admin");
useSearchParams.mockReturnValue({
  get: vi.fn(),
});

describe("the OperationRegistrationPage component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the Operation Information Form", async () => {
    fetchFormEnums(Apps.REGISTRATION);
    render(
      await OperationRegistrationPage({
        step: 1,
        // @ts-ignore
        operation: undefined, // the first step won't have an operation parameter because operation hasn't been selected yet
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Information",
    );
  });

  it("should render the Facility Information Form with 4 steps", async () => {
    useSearchParams.mockReturnValue({
      searchParams: {
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        operationsTitle: "Test Operation",
        step: 2,
      },
      get: vi.fn(),
    });
    actionHandler.mockReturnValue({
      rows: [],
      rowCount: 0,
    });
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "OBPS Regulated Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 2,
        searchParams: {},
      }),
    );

    expect(
      screen.getByText("Facility Information", {
        selector: "div.form-heading",
      }),
    ).toBeVisible();
  });

  it("should render 5 steps and the Opt-in Application Form if the registration purpose is Opt-in", async () => {
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "Opted-in Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Opt-In Application",
    );
  });

  it("should render 5 steps and the New Entrant Application Form if the registration purpose is New Entrant", async () => {
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "New Entrant Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 3,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );
  });

  it("should render the Operation Representative Form and 3 steps if the purpose is Electricity Import Operation", async () => {
    // purpose
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "Electricity Import Operation",
    });

    // contacts
    actionHandler.mockResolvedValueOnce({
      items: [],
      count: 0,
    });

    // existingOperationRepresentatives
    actionHandler.mockResolvedValueOnce([]);

    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 2,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Operation Representative",
    );
  });

  it("should render the Submission Form and 5 steps", async () => {
    actionHandler.mockResolvedValueOnce({
      registration_purpose: "New Entrant Operation",
    });
    render(
      await OperationRegistrationPage({
        operation: "002d5a9e-32a6-4191-938c-2c02bfec592d",
        step: 5,
        searchParams: {},
      }),
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Submission",
    );
  });
});
