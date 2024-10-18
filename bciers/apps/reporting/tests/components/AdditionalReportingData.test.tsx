import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import AdditionalReportingData from "@reporting/src/app/components/additionalInformation/AdditionalReportingData";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
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
    // Use vi's type-safe mock instead of jest.Mock
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
    render(<AdditionalReportingData versionId={versionId} />);
    const capturedEmissionsText = await screen.findByText(
      "Captured emissions (Optional)",
    );
    expect(capturedEmissionsText).toBeInTheDocument();
  });

  it("updates formData when form input changes", async () => {
    render(<AdditionalReportingData versionId={versionId} />);

    const yesRadioButton = screen.getByLabelText("Yes");
    fireEvent.click(yesRadioButton);

    expect(yesRadioButton).toBeChecked();

    const captureTypeField = await screen.findByText("Capture type");
    expect(captureTypeField).toBeInTheDocument();
  });

  it("updates schema dynamically based on registration purpose", async () => {
    (getRegistrationPurpose as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      registration_purposes: ["Reporting Operation"],
    });

    render(<AdditionalReportingData versionId={versionId} />);
    await waitFor(() =>
      expect(getRegistrationPurpose).toHaveBeenCalledWith(versionId),
    );

    const yesRadioButton = screen.getByLabelText("Yes");
    fireEvent.click(yesRadioButton);

    expect(screen.getByText("Electricity generated")).toBeInTheDocument();
  });

  it("submits form data and redirects on success", async () => {
    render(<AdditionalReportingData versionId={versionId} />);

    await waitFor(() => {
      const submitButton = screen.getByRole("button", {
        name: /Save And Continue/i,
      });
      expect(submitButton).toBeInTheDocument(); // Confirm it's in the document
    });

    const submitButton = screen.getByRole("button", {
      name: /Save And Continue/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith(
      `/reports/${versionId}/new-entrant-information`,
    );
  });
});
