import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, Mock, it, expect } from "vitest";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import LFOFacilitiesForm from "@reporting/src/app/components/operations/reviewFacilities/ReviewFacilitiesForm";
import expectButton from "@bciers/testConfig/helpers/expectButton";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockRouterPush = vi.fn();
useRouter.mockReturnValue({
  push: mockRouterPush,
});

const config = {
  buttons: {
    back: "Back",
    save: "Save",
    saveAndContinue: "Save & Continue",
    continue: "Continue",
    cancel: "Cancel",
  },
  urls: {
    back: "/reports/1/person-responsible",
    continue: "/reports/1/facilities/report-information",
  },
};

const mockFacilitiesInitialData = {
  current_facilities: [
    {
      facility_id: "fake-guid1",
      facility__name: "Facility 1",
      is_selected: true,
    },
    {
      facility_id: "fake-guid2",
      facility__name: "Facility 2",
      is_selected: false,
    },
  ],
  past_facilities: [
    {
      facility_id: "fake-guid3",
      facility__name: "Facility 3",
      is_selected: true,
    },
    {
      facility_id: "fake-guid4",
      facility__name: "Facility 4",
      is_selected: false,
    },
  ],
};

const mockFacilitiesInitialDataWithoutPastFacility = {
  current_facilities: [
    {
      facility_id: "fake-guid1",
      facility__name: "Facility 1",
      is_selected: true,
    },
    {
      facility_id: "fake-guid2",
      facility__name: "Facility 2",
      is_selected: false,
    },
  ],
  past_facilities: [],
};

describe("LFOFacilitiesForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form correctly after loading", async () => {
    render(
      <LFOFacilitiesForm
        initialData={mockFacilitiesInitialData}
        version_id={1}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Review Facilities")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        "List of facilities currently assigned to this operation",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Facility 1")).toBeInTheDocument();
    expect(screen.getByText("Facility 2")).toBeInTheDocument();
    expect(
      screen.getByText("Past facilities that belonged to this operation"),
    ).toBeInTheDocument();
    expect(screen.getByText("Facility 3")).toBeInTheDocument();
    expect(screen.getByText("Facility 4")).toBeInTheDocument();

    expect(
      screen.getByText("Sync latest data from Administration"),
    ).toBeInTheDocument();

    expectButton(config.buttons.back, true);
    expectButton(config.buttons.saveAndContinue, true);
    expectButton(config.buttons.save, true);
  });

  it("should handle case where no facilities are selected", async () => {
    (actionHandler as Mock).mockResolvedValueOnce(mockFacilitiesInitialData);

    render(
      <LFOFacilitiesForm
        initialData={mockFacilitiesInitialData}
        version_id={1}
      />,
    );

    const checkbox1 = screen.getByRole("checkbox", {
      name: "Facility 1 Facility 1",
    });
    const checkbox3 = screen.getByRole("checkbox", {
      name: "Facility 3 Facility 3",
    });
    fireEvent.click(checkbox1);
    fireEvent.click(checkbox3);

    expect(screen.getByText("No facilities selected")).toBeInTheDocument();
    expectButton(config.buttons.continue, false);
    expectButton(config.buttons.save, false);
  });

  it(
    "should handle case where selected facilities are deselected",
    {
      timeout: 10000,
    },
    async () => {
      (actionHandler as Mock).mockResolvedValueOnce(mockFacilitiesInitialData);

      render(
        <LFOFacilitiesForm
          initialData={mockFacilitiesInitialData}
          version_id={1}
        />,
      );

      const checkbox1 = screen.getByRole("checkbox", {
        name: "Facility 1 Facility 1",
      });
      fireEvent.click(checkbox1);

      const saveButton = screen.getByRole("button", {
        name: config.buttons.save,
      });
      fireEvent.click(saveButton);
      // Assert that the confirmation modal is displayed
      await waitFor(() => {
        expect(screen.getByText("Confirmation")).toBeInTheDocument();
      });
      expect(
        screen.getByText("You have deselected the following facilities:"),
      ).toBeInTheDocument();
      // Assert that the deselected facility is displayed
      expect(screen.getAllByText("Facility 1")).toHaveLength(2);
      // Assert that the unselected facility (was not and still is not selected) is not displayed
      expect(screen.getAllByText("Facility 2")).toHaveLength(1);

      const cancelButton = screen.getByRole("button", {
        name: config.buttons.cancel,
      });
      fireEvent.click(cancelButton);
      await waitFor(() => {
        // Assert that the confirmation modal is closed
        expect(screen.queryByText("Confirmation")).not.toBeInTheDocument();
      });

      const saveAndContinueButton = screen.getByRole("button", {
        name: config.buttons.saveAndContinue,
      });
      fireEvent.click(saveAndContinueButton);
      await waitFor(() => {
        expect(screen.getByText("Confirmation")).toBeInTheDocument();
      });
      const continueButton = screen.getByRole("button", {
        name: config.buttons.continue,
      });
      fireEvent.click(continueButton);
      await waitFor(() => {
        expect(mockRouterPush).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith(config.urls.continue);
      });
    },
  );

  it("should route to the Person Responsible page when the Back button is clicked", async () => {
    (actionHandler as Mock).mockResolvedValueOnce(mockFacilitiesInitialData);

    render(
      <LFOFacilitiesForm
        initialData={mockFacilitiesInitialData}
        version_id={1}
      />,
    );

    const backButton = screen.getByRole("button", {
      name: config.buttons.back,
    });
    fireEvent.click(backButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith(config.urls.back);
  });

  it("should not route to the next page when Save & Continue is click and then canceled and then Save is clicked", async () => {
    (actionHandler as Mock).mockResolvedValueOnce(mockFacilitiesInitialData);

    render(
      <LFOFacilitiesForm
        initialData={mockFacilitiesInitialData}
        version_id={1}
      />,
    );

    const checkbox1 = screen.getByRole("checkbox", {
      name: "Facility 1 Facility 1",
    });
    fireEvent.click(checkbox1);

    const saveAndContinueButton = screen.getByRole("button", {
      name: config.buttons.saveAndContinue,
    });
    fireEvent.click(saveAndContinueButton);
    await waitFor(() => {
      expect(screen.getByText("Confirmation")).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole("button", {
      name: config.buttons.cancel,
    });
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByText("Confirmation")).not.toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", {
      name: config.buttons.save,
    });
    fireEvent.click(saveButton);

    expect(mockRouterPush).toHaveBeenCalledTimes(0);
  });

  it("should not show past facilities section if no facilities are selected", async () => {
    (actionHandler as Mock).mockResolvedValueOnce(
      mockFacilitiesInitialDataWithoutPastFacility,
    );

    render(
      <LFOFacilitiesForm
        initialData={mockFacilitiesInitialDataWithoutPastFacility}
        version_id={1}
      />,
    );

    await waitFor(() => {
      expect(
        screen.queryByText("Past facilities that belonged to this operation"),
      ).not.toBeInTheDocument();
    });

    // Ensure that current facilities are still rendered
    expect(screen.getByText("Facility 1")).toBeInTheDocument();
    expect(screen.getByText("Facility 2")).toBeInTheDocument();
  });
});
