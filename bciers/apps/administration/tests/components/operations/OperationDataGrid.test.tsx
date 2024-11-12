import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import OperationDataGrid from "apps/administration/app/components/operations/OperationDataGrid";
import React from "react";

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
      operator: "FakeOperator",
      name: "Operation 1",
      bcghg_id: "12111130001",
      type: "Single Facility Operation",
      sfo_facility_id: null,
      sfo_facility_name: null,
      status: "Draft",
      bc_obps_regulated_operation: "N/A",
    },
    {
      id: 2,
      operator: "FakeOperator",
      name: "Operation 2",
      bcghg_id: "12111130002",
      type: "Linear Facility Operation",
      sfo_facility_id: null,
      sfo_facility_name: null,
      status: "Registered",
      bc_obps_regulated_operation: "24-0001",
    },
    {
      id: 3,
      operator: "FakeOperator",
      name: "Operation 3",
      bcghg_id: "12111130003",
      type: "Single Facility Operation",
      sfo_facility_id: null,
      sfo_facility_name: null,
      status: "Not Started",
      bc_obps_regulated_operation: "N/A",
    },
    {
      id: 4,
      operator: "FakeOperator",
      name: "Operation 4",
      bcghg_id: "12111130004",
      type: "Single Facility Operation",
      status: "Draft",
      sfo_facility_id: "facility-test-id",
      sfo_facility_name: "Facility Test Name",
      bc_obps_regulated_operation: "N/A",
    },
  ],
  row_count: 4,
};

describe("OperationsDataGrid component", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });
  it("renders the OperationsDataGrid grid for external users", async () => {
    render(
      <OperationDataGrid isInternalUser={false} initialData={mockResponse} />,
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: "Operation Type" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "BORO ID" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Operation Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Facilities" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Action" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(5);

    // Check data displays
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.queryAllByText(/FakeOperator/i)).toHaveLength(0);
    expect(screen.getByText(/24-0001/i)).toBeVisible();
    expect(screen.getByText(/Registered/i)).toBeVisible();
    expect(screen.getByText(/Not Started/i)).toBeVisible();
    expect(screen.getByText(/12111130001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility Operation/i)).toHaveLength(3);
    expect(
      screen.getAllByRole("link", { name: /View Facilities/i }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("link", { name: /View Facility/i }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("link", { name: /View Operation/i }),
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("link", { name: /Continue Registration/i }),
    ).toHaveLength(2);
    expect(
      screen.getAllByRole("link", { name: /Start Registration/i }),
    ).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: /Edit details/i })).toHaveLength(
      2,
    );
  });

  it("renders the OperationsDataGrid grid for internal users", async () => {
    render(
      <OperationDataGrid isInternalUser={true} initialData={mockResponse} />,
    );

    // correct headers
    expect(
      screen.getByRole("columnheader", { name: "Operation Name" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("columnheader", { name: "Operator Legal Name" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "BORO ID" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "BC GHG ID" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Operation Type" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Facilities" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Action" })).toBeVisible();
    expect(screen.queryAllByPlaceholderText(/Search/i)).toHaveLength(6);

    // Check data displays
    expect(screen.getByText(/Operation 1/i)).toBeVisible();
    expect(screen.queryAllByText(/FakeOperator/i)).toHaveLength(4);
    expect(screen.getByText(/24-0001/i)).toBeVisible();
    expect(screen.getByText(/Registered/i)).toBeVisible();
    expect(screen.getByText(/Not Started/i)).toBeVisible();
    expect(screen.getAllByText(/Draft/i)).toHaveLength(2);
    expect(screen.getByText(/12111130001/i)).toBeVisible();
    expect(screen.getAllByText(/Single Facility Operation/i)).toHaveLength(3);

    expect(
      screen.getAllByRole("link", { name: /View Operation/i }),
    ).toHaveLength(4);
    expect(
      screen.getAllByRole("link", { name: /View Facility/i }),
    ).toHaveLength(1);
  });

  it("renders the correct url for the LFO facilities link", async () => {
    render(
      <OperationDataGrid isInternalUser={true} initialData={mockResponse} />,
    );

    const facilitiesLink = screen.getByRole("link", {
      name: /View Facilities/i,
    });

    expect(facilitiesLink).toHaveAttribute(
      "href",
      "operations/2/facilities?operations_title=Operation+2",
    );
  });

  it("renders the correct url for the SFO facilities link", async () => {
    render(
      <OperationDataGrid isInternalUser={true} initialData={mockResponse} />,
    );

    const facilityLink = screen.getByRole("link", {
      name: /View Facility/i,
    });

    expect(facilityLink).toHaveAttribute(
      "href",
      "operations/4/facilities/facility-test-id?operations_title=Operation+4&facilities_title=Facility+Test+Name",
    );
  });

  it("renders the correct url for the SFO facilities link when no facility id is present", async () => {
    render(
      <OperationDataGrid isInternalUser={false} initialData={mockResponse} />,
    );

    const facilityLinks = screen.getAllByRole("link", {
      name: /Edit details/i,
    });

    expect(facilityLinks[0]).toHaveAttribute(
      "href",
      "operations/1/facilities/add-facility?operations_title=Operation+1",
    );
  });

  it("renders the correct url for the operation information link", async () => {
    render(
      <OperationDataGrid isInternalUser={true} initialData={mockResponse} />,
    );

    const operationInfoLinks = screen.getAllByRole("link", {
      name: /View Operation/i,
    });

    expect(operationInfoLinks[0]).toHaveAttribute(
      "href",
      "/operations/1?operations_title=Operation+1",
    );
    expect(operationInfoLinks[1]).toHaveAttribute(
      "href",
      "/operations/2?operations_title=Operation+2",
    );
  });
});
