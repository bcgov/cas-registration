import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import FacilityDataGrid from "apps/registration/app/components/facilities/FacilityDataGrid";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse = {
  rows: [
    {
      id: 1,
      name: "Facility 1",
      type: "Single Facility",
      bcghg_id: "1-211113-0001",
    },
    {
      id: 2,
      name: "Facility 2",
      type: "Large Facility",
      bcghg_id: "1-211113-0002",
    },
  ],
  row_count: 2,
};

describe("OperationsDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the FacilityDataGrid grid", async () => {
    render(
      <FacilityDataGrid
        operationId="randomOperationUUID"
        initialData={mockResponse}
      />,
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Facility Name" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Facility Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(3);

    // Check data displays
    expect(screen.getByText(/Facility 1/i)).toBeVisible();
    expect(screen.getByText(/1-211113-0001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility/i)).toHaveLength(1);
    expect(screen.getByText(/Facility 2/i)).toBeVisible();
    expect(screen.getByText(/1-211113-0002/i)).toBeVisible();
    expect(screen.getAllByText(/Large Facility/i)).toHaveLength(1);
    // Check the number of view details links
    expect(screen.getAllByRole("link", { name: /View Details/i })).toHaveLength(
      2,
    );
  });
});
