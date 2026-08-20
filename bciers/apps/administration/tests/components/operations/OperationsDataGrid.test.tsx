import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "@bciers/testConfig/mocks";
import OperationsDataGrid from "apps/administration/app/components/operations/OperationsDataGrid";
import { OperationStatus, OperationTypes } from "@bciers/utils/src/enums";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";
import { expect } from "vitest";
import { OperationRow } from "@/administration/app/components/operations/types";

useRouter.mockReturnValue({
  query: {},
  replace: vi.fn(),
});

useSearchParams.mockReturnValue({
  get: vi.fn(),
});

const mockResponse: { rows: OperationRow[]; row_count: number } = {
  rows: [
    {
      id: 1,
      operator__legal_name: "FakeOperator",
      operation__name: "Operation 1",
      operation__bcghg_id: "12111130001",
      operation__type: OperationTypes.SFO,
      sfo_facility_id: null,
      sfo_facility_name: null,
      operation__bc_obps_regulated_operation: null,
      operation__status: OperationStatus.NOT_STARTED,
      operation__id: "11111111-1111-4111-8111-111111111111",
      operation__registration_purpose: RegistrationPurposes.REPORTING_OPERATION,
      status: OperationStatus.NOT_STARTED,
      operation__contact_ids: [1],
    },
    {
      id: 2,
      operator__legal_name: "FakeOperator",
      operation__name: "Operation 2",
      operation__bcghg_id: "12111130002",
      operation__type: OperationTypes.LFO,
      sfo_facility_id: null,
      sfo_facility_name: null,
      operation__bc_obps_regulated_operation: "24-0001",
      operation__status: OperationStatus.DRAFT,
      operation__id: "22222222-2222-4222-8222-222222222222",
      operation__registration_purpose:
        RegistrationPurposes.NEW_ENTRANT_OPERATION,
      status: OperationStatus.DRAFT,
      operation__contact_ids: [2],
    },
    {
      id: 3,
      operator__legal_name: "FakeOperator",
      operation__name: "Operation 3",
      operation__bcghg_id: "12111130003",
      operation__type: OperationTypes.SFO,
      sfo_facility_id: null,
      sfo_facility_name: null,
      operation__bc_obps_regulated_operation: null,
      operation__status: OperationStatus.DRAFT,
      operation__id: "33333333-3333-4333-8333-333333333333",
      operation__registration_purpose: RegistrationPurposes.OPTED_IN_OPERATION,
      status: OperationStatus.DRAFT,
      operation__contact_ids: [3],
    },
    {
      id: 4,
      operator__legal_name: "FakeOperator",
      operation__name: "Operation 4",
      operation__bcghg_id: "12111130004",
      operation__type: OperationTypes.SFO,
      sfo_facility_id: "facility-test-id",
      sfo_facility_name: "Facility Test Name",
      operation__bc_obps_regulated_operation: null,
      operation__status: OperationStatus.REGISTERED,
      operation__id: "44444444-4444-4444-8444-444444444444",
      status: OperationStatus.REGISTERED,
      operation__contact_ids: [4],
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
      <OperationsDataGrid
        isInternalUser={false}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
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
      <OperationsDataGrid
        isInternalUser={true}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
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
    expect(screen.queryAllByText(/FakeOperator/i)).toHaveLength(4);
    expect(screen.getByText(/24-0001/i)).toBeVisible();
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
      <OperationsDataGrid
        isInternalUser={true}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
    );

    const facilitiesLink = screen.getByRole("link", {
      name: /View Facilities/i,
    });

    expect(facilitiesLink).toHaveAttribute(
      "href",
      "/operations/22222222-2222-4222-8222-222222222222/facilities?operations_title=Operation+2",
    );
  });

  it("renders the correct url for the SFO facilities link", async () => {
    render(
      <OperationsDataGrid
        isInternalUser={true}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
    );

    const facilityLink = screen.getByRole("link", {
      name: /View Facility/i,
    });

    expect(facilityLink).toHaveAttribute(
      "href",
      "/operations/44444444-4444-4444-8444-444444444444/facilities/facility-test-id?operations_title=Operation+4&facilities_title=Facility+Test+Name",
    );
  });

  it("renders the correct url for the SFO facilities link when no facility id is present", async () => {
    render(
      <OperationsDataGrid
        isInternalUser={false}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
    );

    const facilityLinks = screen.getAllByRole("link", {
      name: /Edit details/i,
    });

    expect(facilityLinks[0]).toHaveAttribute(
      "href",
      "/operations/11111111-1111-4111-8111-111111111111/facilities/add-facility?operations_title=Operation+1",
    );
  });

  it("renders the correct url for the operation information link for internal users", async () => {
    render(
      <OperationsDataGrid
        isInternalUser={true}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
    );

    const operationInfoLinks = screen.getAllByRole("link", {
      name: /View Operation/i,
    });

    expect(operationInfoLinks[0]).toHaveAttribute(
      "href",
      "/administration/operations/11111111-1111-4111-8111-111111111111?operations_title=Operation 1",
    );
    expect(operationInfoLinks[1]).toHaveAttribute(
      "href",
      "/administration/operations/22222222-2222-4222-8222-222222222222?operations_title=Operation 2",
    );
  });

  it("renders the correct url for the operation information link for external users", async () => {
    render(
      <OperationsDataGrid
        isInternalUser={false}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
    );

    expect(screen.getAllByText(/Draft/i)).toHaveLength(2);
    expect(screen.getByText(/Not Started/i)).toBeVisible();
    expect(screen.getByText(/Registered/i)).toBeVisible();

    expect(
      screen.getByRole("link", {
        name: /Start registration/i,
      }),
    ).toHaveAttribute("href", "/registration/register-an-operation");
    expect(
      screen.getByRole("link", {
        name: /view operation/i,
      }),
    ).toHaveAttribute(
      "href",
      "/administration/operations/44444444-4444-4444-8444-444444444444?operations_title=Operation 4",
    );

    const continueRegistrationlinks = screen.getAllByRole("link", {
      name: /continue registration/i,
    });

    expect(continueRegistrationlinks[0]).toHaveAttribute(
      "href",
      "/registration/register-an-operation/22222222-2222-4222-8222-222222222222/1?continueRegistration=true",
    );
    expect(continueRegistrationlinks[1]).toHaveAttribute(
      "href",
      "/registration/register-an-operation/33333333-3333-4333-8333-333333333333/1?continueRegistration=true",
    );
  });
  it("renders the correct text about BORO ID column depending the registration purpose", async () => {
    render(
      <OperationsDataGrid
        isInternalUser={true}
        initialData={mockResponse}
        filteredSearchParams={{}}
      />,
    );
    expect(screen.getAllByRole("gridcell")[3]).toHaveTextContent("N/A");
    expect(screen.getAllByRole("gridcell")[10]).toHaveTextContent("24-0001");
    expect(screen.getAllByRole("gridcell")[17]).toHaveTextContent("Pending");
    expect(screen.getAllByRole("gridcell")[24]).toHaveTextContent("");
  });
});
