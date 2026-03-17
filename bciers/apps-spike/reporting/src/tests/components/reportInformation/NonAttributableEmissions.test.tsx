import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { vi } from "vitest";
import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { UUID } from "crypto";
import { dummyNavigationInformation } from "../taskList/utils";

// Mock next/navigation and action handler
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

describe("NonAttributableEmissionsForm Component", () => {
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
      refresh: vi.fn(),
    });

    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updates form data when the 'emissions exceeded' radio button is clicked", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={[]}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        gasTypeMap={{ 1: "CO2" }}
        emissionCategoryMap={{ 1: "Direct" }}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const yesRadioButton = screen.getByLabelText("Yes");
    fireEvent.click(yesRadioButton);
    expect(yesRadioButton).toBeChecked();

    const activityNameField = await screen.findByText("Activity Name"); // Ensure the correct text matches
    expect(activityNameField).toBeInTheDocument();
  });

  it("renders the form with the correct initial fields", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={[]}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        gasTypeMap={{ 1: "CO2" }}
        emissionCategoryMap={{ 1: "Direct" }}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const emissionExceededText = await screen.findByText(
      "Did your non-attributable emissions exceed 100 tCO2e?",
    );
    expect(emissionExceededText).toBeInTheDocument();
  });

  it("submits form data and redirects to summary page on successful submission", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={[]}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        gasTypeMap={{ 1: "CO2" }}
        emissionCategoryMap={{ 1: "Direct" }}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });
    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith(`continue`);
  });

  it("handles submission failure gracefully", async () => {
    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      success: false,
    });

    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={[]}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        gasTypeMap={{ 1: "CO2" }}
        emissionCategoryMap={{ 1: "Direct" }}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    const submitButton = await screen.findByRole("button", {
      name: /Save & Continue/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
  });
});
