import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";
import ElectricityInformationForm from "@reporting/src/app/components/eio/ElectricityInformationForm";

const mockPush = vi.fn();
const mockVersionId = 1;

describe("ElectricityInformationForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useRouter.mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      bfcacheId: "",
    });

    actionHandler.mockResolvedValue({
      success: true,
    });
  });

  it("renders form with correct initial fields", async () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      await screen.findByText("Electricity Import Data"),
    ).toBeInTheDocument();
  });

  it("updates formData when form input changes", () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const input = screen.getByLabelText(
      /Amount of imported electricity - specified sources/i,
    );

    fireEvent.change(input, { target: { value: "1234" } });

    expect(input).toHaveValue("1234");
  });

  it("submits form data and handles success", async () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{
          import_specified_electricity: 0,
          import_specified_emissions: 0,
          import_unspecified_electricity: 0,
          import_unspecified_emissions: 0,
          export_specified_electricity: 0,
          export_specified_emissions: 0,
          export_unspecified_electricity: 0,
          export_unspecified_emissions: 0,
          canadian_entitlement_electricity: 0,
          canadian_entitlement_emissions: 0,
        }}
        navigationInformation={{
          ...dummyNavigationInformation,
          continueUrl: "/next-page",
        }}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith("/next-page");
  });

  it("renders all expected form fields", async () => {
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{}}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const inputs = await screen.findAllByRole("textbox");

    expect(inputs).toHaveLength(10);
  });

  it("displays an error message when the request fails", async () => {
    const errorMessage = "Unable to complete the request.";
    actionHandler.mockResolvedValueOnce({
      error: errorMessage,
    });
    render(
      <ElectricityInformationForm
        versionId={mockVersionId}
        initialFormData={{
          import_specified_electricity: 0,
          import_specified_emissions: 0,
          import_unspecified_electricity: 0,
          import_unspecified_emissions: 0,
          export_specified_electricity: 0,
          export_specified_emissions: 0,
          export_unspecified_electricity: 0,
          export_unspecified_emissions: 0,
          canadian_entitlement_electricity: 0,
          canadian_entitlement_emissions: 0,
        }}
        navigationInformation={{
          ...dummyNavigationInformation,
          continueUrl: "/next-page",
        }}
      />,
    );
    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });
    fireEvent.click(submitButton);
    expect(await screen.findByText(errorMessage)).toBeVisible();
    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler).toHaveBeenCalledWith(
      `reporting/report-version/${mockVersionId}/electricity-import-data`,
      "POST",
      `reporting/report-version/${mockVersionId}/electricity-import-data`,
      expect.anything(),
    );
    expect(mockPush).not.toHaveBeenCalled();
  });
});
