import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { useRouter, useSearchParams } from "next/navigation";
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
    // Use vi's type-safe mock instead of jest.Mock
    // Mock useRouter
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
    });

    // Mock actionHandler
    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });

    // Mock useSearchParams to return `?facility_id=abc`
    (useSearchParams as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams("?facility_id=abc"),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with correct initial fields", async () => {
    render(
      <AdditionalReportingDataForm
        versionId={versionId}
        includeElectricityGenerated={false}
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
      />,
    );

    const element = await screen.findByText("Electricity Generated");
    expect(element).toBeInTheDocument();
  });

  it(
    "submits form data and redirects on success",
    {
      timeout: 10000,
    },
    async () => {
      render(
        <AdditionalReportingDataForm
          versionId={versionId}
          includeElectricityGenerated={false}
        />,
      );

      await waitFor(() => {
        const submitButton = screen.getByRole("button", {
          name: /Save & Continue/i,
        });
        expect(submitButton).toBeInTheDocument(); // Confirm it's in the document
      });

      const submitButton = screen.getByRole("button", {
        name: /Save & Continue/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(actionHandler).toHaveBeenCalled());
      expect(mockPush).toHaveBeenCalledWith(
        `/reports/${versionId}/new-entrant-information`,
      );
    },
  );
});
