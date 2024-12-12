import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingDataForm from "@reporting/src/app/components/additionalInformation/additionalReportingData/AdditionalReportingDataForm";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

vi.mock("@reporting/src/app/utils/getRegistrationPurpose", () => ({
  getRegistrationPurpose: vi.fn(),
}));

describe("AdditionalReportingData Component", () => {
  const versionId = 1;
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    });

    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValue({
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
        isNewEntrant={true}
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
        isNewEntrant={true}
      />,
    );

    const yesRadioButton = screen.getByLabelText("Yes");
    fireEvent.click(yesRadioButton);

    expect(yesRadioButton).toBeChecked();

    const captureTypeField = await screen.findByText("Capture type");
    expect(captureTypeField).toBeInTheDocument();
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
        isNewEntrant={false}
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
        isNewEntrant={true}
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

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith(`new-entrant-information`);
  });
});
