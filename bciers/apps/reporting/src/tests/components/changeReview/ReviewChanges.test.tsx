import React from "react";
import { render, screen } from "@testing-library/react";
import { ReviewChanges } from "@reporting/src/app/components/changeReview/templates/ReviewChanges";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";

// Mock all the template components
vi.mock(
  "@reporting/src/app/components/changeReview/templates/ChangeItemDisplay",
  () => ({
    ChangeItemDisplay: ({ item }: any) => (
      <div data-testid={`change-item-${item.field}`}>
        {item.field}: {item.oldValue} → {item.newValue}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/FacilityReportChanges",
  () => ({
    FacilityReportChanges: ({ facilityName }: any) => (
      <div data-testid={`facility-${facilityName}`}>
        Facility: {facilityName}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/ComplianceSummary",
  () => ({
    default: ({ changes }: any) => (
      <div data-testid="compliance-summary">
        Compliance changes: {changes.length}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/OperationEmissionSummary",
  () => ({
    default: ({ changes }: any) => (
      <div data-testid="operation-emission-summary">
        Operation emission changes: {changes.length}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/ElectricityImportData",
  () => ({
    default: ({ changes }: any) => (
      <div data-testid="electricity-import-data">
        Electricity import changes: {changes.length}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/NewEntrantChanges",
  () => ({
    default: ({ changes }: any) => (
      <div data-testid="new-entrant-changes">
        New entrant changes: {changes.length}
      </div>
    ),
  }),
);

// Mock utility functions
vi.mock("@reporting/src/app/components/changeReview/utils/utils", () => ({
  filterExcludedFields: vi.fn((changes) => changes),
  getSection: vi.fn((field) => {
    if (field.includes("person_responsible")) return "Person Responsible";
    if (field.includes("contact")) return "Contact Information";
    return "Other";
  }),
  groupPersonResponsibleChanges: vi.fn((changes) => changes),
  normalizeChangeKeys: vi.fn((changes) => changes),
}));

vi.mock(
  "@reporting/src/app/components/changeReview/templates/facilityReportOrganizer",
  () => ({
    organizeFacilityReportChanges: vi.fn(() => ({
      "Test Facility": {
        facilityName: "Test Facility",
        activities: {},
        emissionSummary: [],
        productionData: [],
        emissionAllocation: [],
        nonAttributableEmissions: [],
        changeType: "modified",
      },
    })),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/facilityReportParser",
  () => ({
    detectAddedActivitiesInModifiedFacility: vi.fn(() => null),
    detectSourceTypeChanges: vi.fn(() => []),
    detectActivityChangesInModifiedFacility: vi.fn(() => null),
  }),
);

describe("ReviewChanges", () => {
  const mockChanges: ChangeItem[] = [
    {
      field: "root['report_information']['test_field']",
      oldValue: "oldValue",
      newValue: "newValue",
      facilityName: "Mock Facility",
      change_type: "modified",
      deletedActivities: [],
    },
    {
      field: "root['report_compliance_summary']['compliance_field']",
      oldValue: "old_compliance",
      newValue: "new_compliance",
      facilityName: "", // required, even if empty
      change_type: "modified",
      deletedActivities: [],
    },
    {
      field: "root['facility_reports']['facility_1']['some_field']",
      oldValue: "old_facility",
      newValue: "new_facility",
      facilityName: "Mock Facility",
      change_type: "modified",
      deletedActivities: [],
    },
    {
      field: "root['report_electricity_import_data']['electricity_field']",
      oldValue: "old_electricity",
      newValue: "new_electricity",
      facilityName: "", // required
      change_type: "modified",
      deletedActivities: [],
    },
    {
      field: "root['report_new_entrant']['new_entrant_field']",
      oldValue: "old_entrant",
      newValue: "new_entrant",
      facilityName: "", // required
      change_type: "modified",
      deletedActivities: [],
    },
    {
      field: "root['operation_emission_summary']['emission_field']",
      oldValue: "old_emission",
      newValue: "new_emission",
      facilityName: "", // required
      change_type: "modified",
      deletedActivities: [],
    },
    {
      field: "root['person_responsible']['name']",
      oldValue: "old_name",
      newValue: "new_name",
      facilityName: "", // required
      change_type: "modified",
      deletedActivities: [],
    },
  ];

  it("renders all sections when changes are provided", () => {
    render(<ReviewChanges changes={mockChanges} />);

    // Check Person Responsible section
    expect(screen.getByText("Person Responsible")).toBeInTheDocument();
    expect(
      screen.getByTestId("change-item-root['person_responsible']['name']"),
    ).toBeInTheDocument();

    // Check Compliance Summary section (rendered as regular section, not component)
    expect(screen.getByText("Compliance Summary")).toBeInTheDocument();
    expect(
      screen.getByTestId(
        "change-item-root['report_compliance_summary']['compliance_field']",
      ),
    ).toBeInTheDocument();

    // Check specialized component sections
    expect(
      screen.getByTestId("operation-emission-summary"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("electricity-import-data")).toBeInTheDocument();
    expect(screen.getByTestId("new-entrant-changes")).toBeInTheDocument();

    // Check facility changes
    expect(screen.getByTestId("facility-Test Facility")).toBeInTheDocument();
  });

  it("renders empty state when no changes are provided", () => {
    render(<ReviewChanges changes={[]} />);

    expect(
      screen.getByText(
        "No changes detected between the selected report versions.",
      ),
    ).toBeInTheDocument();
  });

  it("only renders sections that have changes", () => {
    const limitedChanges = [
      {
        field: "root['report_information']['test_field']",
        oldValue: "oldValue",
        newValue: "newValue",
        change_type: "modified",
        facilityName: "Mock Facility",
        deletedActivities: [],
      },
    ];

    render(<ReviewChanges changes={limitedChanges} />);

    expect(screen.queryByTestId("compliance-summary")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("operation-emission-summary"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("electricity-import-data"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("new-entrant-changes")).not.toBeInTheDocument();
  });

  it("handles bulk facility changes correctly", () => {
    const bulkFacilityChanges: ChangeItem[] = [
      {
        field: "root['facility_reports']",
        oldValue: {
          "Facility A": { name: "Facility A", data: "old" },
          "Facility B": { name: "Facility B", data: "old" },
        },
        newValue: {
          "Facility A": { name: "Facility A", data: "new" },
          "Facility B": { name: "Facility B", data: "new" },
        },
        change_type: "modified",
        facilityName: "Multiple Facilities",
        deletedActivities: [],
      },
    ];

    render(<ReviewChanges changes={bulkFacilityChanges} />);

    // Should render facility components for each facility in the bulk change
    expect(screen.getByTestId("facility-Test Facility")).toBeInTheDocument();
  });

  it('excludes "Other" section from rendering', () => {
    const otherChanges = [
      {
        field: "root['some_other_field']",
        oldValue: "old_other",
        newValue: "new_other",
        change_type: "modified",
        facilityName: "",
        deletedActivities: [],
      },
    ];

    render(<ReviewChanges changes={otherChanges} />);

    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("handles non-object change values gracefully", () => {
    const invalidChanges = [
      {
        field: "root['facility_reports']",
        oldValue: null,
        newValue: "invalid_value",
        change_type: "modified",
        facilityName: "Test Facility",
        deletedActivities: [],
      },
    ];

    render(<ReviewChanges changes={invalidChanges} />);

    expect(screen.getByTestId("facility-Test Facility")).toBeInTheDocument();
  });
});
