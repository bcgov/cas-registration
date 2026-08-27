import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import NewEntrantInformationForm from "@reporting/src/app/components/additionalInformation/newEntrantInformation/NewEntrantInformationForm";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";

describe("NewEntrantInformationForm Component", () => {
  const versionId = 1;
  let initialFormData = {
    authorization_date: "2024-12-10T09:00:00Z",
    first_shipment_date: "2024-12-25T09:00:00Z",
    new_entrant_period_start: "2024-12-18T09:00:00Z",
    assertion_statement: true,
    id: 1,
  };
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      refresh: vi.fn(),
    });

    actionHandler.mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with initial data", async () => {
    render(
      <NewEntrantInformationForm
        version_id={versionId}
        initialFormData={initialFormData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const formTitle = await screen.findByText("New Entrant Information");
    expect(formTitle).toBeInTheDocument();
  });

  it("disables submit button initially if assertion statement is false", async () => {
    initialFormData = {
      authorization_date: "2024-12-10T09:00:00Z",
      first_shipment_date: "2024-12-25T09:00:00Z",
      new_entrant_period_start: "2024-12-18T09:00:00Z",
      assertion_statement: false,
      id: 1,
    };

    render(
      <NewEntrantInformationForm
        version_id={versionId}
        initialFormData={initialFormData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save & Continue/i,
    });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when assertion statement is true", async () => {
    initialFormData = {
      authorization_date: "2024-12-10T09:00:00Z",
      first_shipment_date: "2024-12-25T09:00:00Z",
      new_entrant_period_start: "2024-12-18T09:00:00Z",
      assertion_statement: true,
      id: 1,
    };
    render(
      <NewEntrantInformationForm
        version_id={versionId}
        initialFormData={initialFormData}
        navigationInformation={dummyNavigationInformation}
      />,
    );
    const submitButton = screen.getByRole("button", {
      name: /Save & Continue/i,
    });

    expect(submitButton).toBeEnabled();
  });

  it("submits form data and redirects on success", async () => {
    initialFormData = {
      authorization_date: "2024-12-10T09:00:00Z",
      first_shipment_date: "2024-12-25T09:00:00Z",
      new_entrant_period_start: "2024-12-18T09:00:00Z",
      assertion_statement: true,
      id: 1,
    };

    render(
      <NewEntrantInformationForm
        version_id={versionId}
        initialFormData={initialFormData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save & Continue/i,
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalled();
    });
    expect(mockPush).toHaveBeenCalledWith("continue");
  });

  it("displays an error message when the request fails", async () => {
    const errorMessage = "Unable to complete the request.";

    initialFormData = {
      authorization_date: "2024-12-10T09:00:00Z",
      first_shipment_date: "2024-12-25T09:00:00Z",
      new_entrant_period_start: "2024-12-18T09:00:00Z",
      assertion_statement: true,
      id: 1,
    };

    actionHandler.mockResolvedValueOnce({
      error: errorMessage,
    });

    render(
      <NewEntrantInformationForm
        version_id={versionId}
        initialFormData={initialFormData}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: /Save & Continue/i,
    });

    fireEvent.click(submitButton);

    expect(await screen.findByText(errorMessage)).toBeVisible();

    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler).toHaveBeenCalledWith(
      `reporting/report-version/${versionId}/new-entrant-data`,
      "POST",
      `reporting/report-version/${versionId}/new-entrant-data`,
      expect.anything(),
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
