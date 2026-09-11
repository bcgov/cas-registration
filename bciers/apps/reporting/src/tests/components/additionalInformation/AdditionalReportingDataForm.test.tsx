import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";

vi.mock("@reporting/src/app/utils/getRegistrationPurpose", () => ({
  getRegistrationPurpose: vi.fn(),
}));

describe("AdditionalReportingData Component", () => {
  const versionId = 1;
  const mockPush = vi.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
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

  it("renders form with correct initial fields", async () => {
    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const capturedEmissionsText = await screen.findByText(
      "Captured emissions (If applicable)",
    );

    expect(capturedEmissionsText).toBeInTheDocument();
  });

  it("updates formData when form input changes", async () => {
    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const yesRadioButton = screen.getByLabelText("Yes");
    fireEvent.click(yesRadioButton);

    expect(yesRadioButton).toBeChecked();

    expect(await screen.findByLabelText(/capture type/i)).toBeVisible();
  });

  it("updates schema dynamically based on registration purpose", async () => {
    (getRegistrationPurpose as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      registration_purpose: "OBPS Regulated Operation",
    });

    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={true}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const element = await screen.findByText("Electricity Generated");

    expect(element).toBeInTheDocument();
  });

  it("submits form data and redirects on success", async () => {
    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    await waitFor(() => {
      const submitButton = screen.getByRole("button", {
        name: /Save & Continue/i,
      });
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", {
      name: /Save & Continue/i,
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("continue");
  });

  it("renders No selected when initialFormData.capture_emissions is false", async () => {
    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
        initialFormData={{
          captured_emissions_section: {
            capture_emissions: false,
          },
        }}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const yesRadioButton = await screen.findByLabelText("Yes");
    const noRadioButton = await screen.findByLabelText("No");

    expect(noRadioButton).toBeChecked();
    expect(yesRadioButton).not.toBeChecked();
  });

  it("renders Yes selected when initialFormData.capture_emissions is true", async () => {
    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
        initialFormData={{
          captured_emissions_section: {
            capture_emissions: true,
          },
        }}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const yesRadioButton = await screen.findByLabelText("Yes");
    const noRadioButton = await screen.findByLabelText("No");

    expect(yesRadioButton).toBeChecked();
    expect(noRadioButton).not.toBeChecked();
  });

  it("displays an error message when the request fails", async () => {
    const errorMessage = "Unable to complete the request.";

    actionHandler.mockResolvedValueOnce({
      error: errorMessage,
    });

    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });

    fireEvent.click(submitButton);

    expect(await screen.findByText(errorMessage)).toBeVisible();

    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler).toHaveBeenCalledWith(
      `reporting/report-version/${versionId}/additional-data`,
      "POST",
      `reporting/report-version/${versionId}/additional-data`,
      expect.anything(),
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});
