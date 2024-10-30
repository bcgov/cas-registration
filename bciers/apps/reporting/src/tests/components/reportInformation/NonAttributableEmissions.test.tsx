import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { vi } from "vitest";
import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { UUID } from "crypto";

// Mock next/navigation and action handler
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

describe("AdditionalReportingData Component", () => {
  const versionId = 1;
  const facilityId = "some-uuid" as UUID;
  const gasTypes = [{ id: 1, chemical_formula: "CO2" }];
  const emissionCategories = [{ id: 1, category_name: "Direct" }];
  const mockPush = vi.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
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

  it("updates form data when an input changes", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
      />,
    );

    const yesRadioButton = screen.getByLabelText("Yes");
    fireEvent.click(yesRadioButton);
    expect(yesRadioButton).toBeChecked();

    const activityNameField = await screen.findByText("Activity Name");
    expect(activityNameField).toBeInTheDocument();
  });

  it("renders the form with the correct initial fields", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
      />,
    );

    const emissionExceededText = await screen.findByText(
      "Did your non-attributable emissions exceed 100 tCO2e?",
    );
    expect(emissionExceededText).toBeInTheDocument();
  });

  it("submits form data and redirects on successful submission", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Save And Continue/i,
    });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith(
      `/reports/${versionId}/facilities/${facilityId}/emissions-summary`,
    );
  });
});
