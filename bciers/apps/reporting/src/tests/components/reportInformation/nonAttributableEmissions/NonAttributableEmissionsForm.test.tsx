import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { vi } from "vitest";
import NonAttributableEmissionsForm from "@reporting/src/app/components/reportInformation/nonAttributableEmissions/NonAttributableEmissionsForm";
import { UUID } from "crypto";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";

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
  const emptyFormData = { emissions_exceeded: false, activities: [] };
  const existingFormData = {
    emissions_exceeded: true,
    activities: [
      {
        id: 1,
        activity: "Test Activity",
        source_type: "Test Source",
        emission_category: "Direct",
        gas_type: ["CO2"],
      },
    ],
  };
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

  it("renders the initial question field", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={emptyFormData}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(
      await screen.findByText(
        "Did your non-attributable emissions exceed 100 tCO2e?",
      ),
    ).toBeVisible();
  });

  it("shows activity fields when 'Yes' is selected", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={emptyFormData}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    fireEvent.click(screen.getByLabelText("Yes"));

    expect(await screen.findByText("Activity Name")).toBeVisible();
    expect(await screen.findByText("Source Type")).toBeVisible();
    expect(await screen.findByText("Emission Category")).toBeVisible();
  });

  it("renders existing emission data when provided", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={existingFormData}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    expect(await screen.findByDisplayValue("Test Activity")).toBeVisible();
    expect(await screen.findByDisplayValue("Test Source")).toBeVisible();
  });

  it("submits form data and navigates on successful submission", async () => {
    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={emptyFormData}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Save & Continue/i }),
    );

    await waitFor(() => expect(actionHandler).toHaveBeenCalled());
    expect(mockPush).toHaveBeenCalledWith("continue");
  });

  it("displays error message on submission failure", async () => {
    (actionHandler as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      error: "Something went wrong",
    });

    render(
      <NonAttributableEmissionsForm
        versionId={versionId}
        facilityId={facilityId}
        emissionFormData={emptyFormData}
        gasTypes={gasTypes}
        emissionCategories={emissionCategories}
        navigationInformation={dummyNavigationInformation}
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: /Save & Continue/i }),
    );

    await waitFor(() =>
      expect(screen.getByText("Something went wrong")).toBeVisible(),
    );
  });
});
