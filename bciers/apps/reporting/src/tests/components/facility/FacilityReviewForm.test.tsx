import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FacilityReviewForm from "@reporting/src/app/components/facility/FacilityReviewForm";
import { vi, Mock } from "vitest"; // If you are using Vitest for mocking

import { actionHandler } from "@bciers/actions";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

const mockFacilityData = {
  id: "00000000-0000-0000-0000-000000000000",
  bcghg_id: "12111130002",
  name: "Facility1",
  facility_type: "SFO",
  activities: [7, 10],
  products: [],
};

const mockActivitiesData = [
  { id: 7, name: "Activity7" },
  { id: 10, name: "Activity10" },
  { id: 12, name: "Activity12" },
];

beforeEach(() => {
  window.alert = vi.fn(); // or vi.fn() if using Vitest
  vi.mock("next/navigation", () => {
    const actual = vi.importActual("next/navigation");
    return {
      ...actual,
      useRouter: vi.fn(() => ({
        push: vi.fn(),
      })),
      useSearchParams: vi.fn(() => ({
        get: vi.fn(),
      })),
      usePathname: vi.fn(),
    };
  });
});

describe("FacilityReviewForm", () => {
  beforeEach(() => {
    (actionHandler as Mock).mockClear();
  });

  it("should render and display labels correctly for activities", async () => {
    (actionHandler as Mock)
      .mockResolvedValueOnce(mockFacilityData) // Mock facility data
      .mockResolvedValueOnce(mockActivitiesData); // Mock activities data

    render(
      <FacilityReviewForm
        version_id={1}
        facility_id={"00000000-0000-0000-0000-000000000000"}
      />,
    );

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(2); // Ensure initial fetches occurred
    });

    expect(screen.getByText("Activity7")).toBeInTheDocument();
    expect(screen.getByText("Activity10")).toBeInTheDocument();
    expect(screen.getByLabelText("Activity7")).toBeChecked();
    expect(screen.getByLabelText("Activity10")).toBeChecked();
    expect(screen.queryByLabelText("Activity12")).not.toBeChecked();
  });

  it("should handle loading state correctly", async () => {
    (actionHandler as Mock).mockImplementationOnce(
      () => new Promise(() => {}), // Mock loading indefinitely
    );

    render(
      <FacilityReviewForm
        version_id={1}
        facility_id={"00000000-0000-0000-0000-000000000000"}
      />,
    );

    fireEvent.click(screen.getByText("Save & Continue"));
    await waitFor(() => {
      expect(screen.getByTestId("progressbar")).toBeInTheDocument();
    });
    await new Promise((r) => setTimeout(r, 1000));
  });

  it("should handle form submission successfully", async () => {
    (actionHandler as Mock)
      .mockResolvedValueOnce(mockFacilityData) // Mock facility data
      .mockResolvedValueOnce(mockActivitiesData) // Mock activities data
      .mockResolvedValueOnce({}); // Mock successful save

    render(
      <FacilityReviewForm
        version_id={1}
        facility_id={"00000000-0000-0000-0000-000000000000"}
      />,
    );

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(2); // Ensure initial fetches occurred
    });

    fireEvent.click(screen.getByText("Save & Continue"));

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledWith(
        `reporting/report-version/1/facility-report/00000000-0000-0000-0000-000000000000`,
        "POST",
        `reporting/report-version/1/facility-report/00000000-0000-0000-0000-000000000000`,
        expect.objectContaining({
          body: JSON.stringify({
            ...mockFacilityData,
            activities: ["7", "10"], // Ensure this matches your implementation
          }),
        }),
      );
    });
  });

  it("should handle form submission error", async () => {
    (actionHandler as Mock)
      .mockResolvedValueOnce(mockFacilityData) // Mock facility data
      .mockResolvedValueOnce(mockActivitiesData) // Mock activities data
      .mockRejectedValueOnce(new Error("Failed to save")); // Mock save error

    render(
      <FacilityReviewForm
        version_id={1}
        facility_id={"00000000-0000-0000-0000-000000000000"}
      />,
    );

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(2); // Ensure initial fetches occurred
    });

    fireEvent.click(screen.getByLabelText("Activity7"));
    fireEvent.click(screen.getByText("Save & Continue"));

    await waitFor(() => {
      expect(screen.getByText("Failed to save")).toBeInTheDocument();
    });
  });

  it("should render with no activities", async () => {
    const mockFacilityDataNoActivities = {
      ...mockFacilityData,
      activities: [], // No activities
    };

    (actionHandler as Mock)
      .mockResolvedValueOnce(mockFacilityDataNoActivities) // Mock facility data with no activities
      .mockResolvedValueOnce([]); // Mock no activities data

    render(
      <FacilityReviewForm
        version_id={1}
        facility_id={"00000000-0000-0000-0000-000000000000"}
      />,
    );

    await waitFor(() => {
      expect(actionHandler).toHaveBeenCalledTimes(2); // Ensure initial fetches occurred
    });

    expect(screen.queryByText("Activity7")).not.toBeInTheDocument();
    expect(screen.queryByText("Activity10")).not.toBeInTheDocument();
  });

  it("should handle error state correctly", async () => {
    // Mock the API calls to simulate an error
    (actionHandler as Mock)
      .mockRejectedValueOnce(new Error("Failed to fetch facility data")) // Simulate error fetching facility data
      .mockRejectedValueOnce(new Error("Failed to fetch activities data")); // Simulate error fetching activities data

    render(
      <FacilityReviewForm
        version_id={1}
        facility_id={"00000000-0000-0000-0000-000000000000"}
      />,
    );

    // Check if error messages are displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Failed to fetch facility data/),
      ).toBeInTheDocument();
    });
  });
});
