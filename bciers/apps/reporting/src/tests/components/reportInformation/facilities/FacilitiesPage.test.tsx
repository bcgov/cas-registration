import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import FacilitiesPage from "@reporting/src/app/components/reportInformation/facilities/FacilitiesPage";
import { fetchFacilitiesPageData } from "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData";
import { getNavigationInformation } from "@reporting/src/app/components/taskList/navigationInformation";

vi.mock(
  "@reporting/src/app/components/reportInformation/facilities/fetchFacilitiesPageData",
  () => ({
    fetchFacilitiesPageData: vi.fn(),
  }),
);

vi.mock("@reporting/src/app/components/taskList/navigationInformation", () => ({
  getNavigationInformation: vi.fn(),
}));

vi.mock(
  "@reporting/src/app/components/reportInformation/facilities/FacilitiesDataGrid",
  () => ({
    default: vi.fn(
      ({
        initialData,
        version_id,
        navigationInformation,
      }: {
        initialData: {
          rows: Array<{
            id: string;
            facility: string;
            facility_bcghgid: string;
            facility_name: string;
            is_completed: boolean;
          }>;
          row_count: number;
          is_completed_count: number;
        };
        version_id: number;
        navigationInformation: { continueUrl: string; backUrl: string };
      }) => (
        <div data-testid="facilities-data-grid">
          <div>version_id: {version_id}</div>
          <div>row_count: {initialData.row_count}</div>
          <div>continueUrl: {navigationInformation.continueUrl}</div>
        </div>
      ),
    ),
  }),
);

describe("FacilitiesPage", () => {
  const version_id = 1;

  const searchParams = {
    page: "1",
  };

  const mockFacilities = {
    rows: [
      {
        id: "1",
        facility: "Facility A",
        facility_bcghgid: "BCGHG-001",
        facility_name: "Facility A",
        is_completed: false,
      },
      {
        id: "2",
        facility: "Facility B",
        facility_bcghgid: "BCGHG-002",
        facility_name: "Facility B",
        is_completed: true,
      },
    ],
    row_count: 2,
    is_completed_count: 1,
  };

  const mockNavigationInformation = {
    headerStepIndex: 0,
    headerSteps: [],
    backUrl: "back",
    continueUrl: "continue",
  };

  beforeEach(() => {
    (fetchFacilitiesPageData as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockFacilities,
    );

    (getNavigationInformation as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockNavigationInformation,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("fetches facilities data and renders FacilitiesDataGrid with the correct props", async () => {
    const component = await FacilitiesPage({
      version_id,
      searchParams,
    });

    render(component);

    expect(fetchFacilitiesPageData).toHaveBeenCalledWith({
      version_id,
      searchParams,
    });

    expect(getNavigationInformation).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      version_id,
      "Facility A",
    );

    expect(screen.getByTestId("facilities-data-grid")).toBeInTheDocument();
    expect(screen.getByText("version_id: 1")).toBeInTheDocument();
    expect(screen.getByText("row_count: 2")).toBeInTheDocument();
    expect(screen.getByText("continueUrl: continue")).toBeInTheDocument();
  });

  it("renders fallback text when no facilities are returned", async () => {
    (fetchFacilitiesPageData as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      null,
    );

    const component = await FacilitiesPage({
      version_id,
      searchParams,
    });

    render(component);

    expect(screen.getByText("No facilities available.")).toBeInTheDocument();
  });

  it("passes the first facility name to getNavigationInformation", async () => {
    const component = await FacilitiesPage({
      version_id,
      searchParams,
    });

    render(component);

    expect(getNavigationInformation).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      version_id,
      mockFacilities.rows[0].facility,
    );
  });
});
