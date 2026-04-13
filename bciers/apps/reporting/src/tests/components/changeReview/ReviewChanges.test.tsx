import { render, screen } from "@testing-library/react";
import { ReviewChanges } from "@reporting/src/app/components/changeReview/templates/ReviewChanges";
import { ChangeItem } from "@reporting/src/app/components/changeReview/constants/types";
import { REGULATED_OPERATION_REGISTRATION_PURPOSE } from "@reporting/src/app/utils/constants";

// Mock template components
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
  "@reporting/src/app/components/changeReview/components/SimpleActivityDiff",
  () => ({
    SimpleActivityDiff: ({ changes }: any) => (
      <div data-testid="simple-activity-diff">
        Activity changes: {changes.length}
      </div>
    ),
  }),
);

vi.mock("@reporting/src/app/components/shared/FacilityReportSection", () => ({
  FacilityReportSection: ({ facilityName, isAdded, isRemoved }: any) => (
    <div data-testid={`facility-section-${facilityName}`}>
      {isAdded ? "added" : isRemoved ? "removed" : "modified"}: {facilityName}
    </div>
  ),
}));

vi.mock(
  "@reporting/src/app/components/finalReview/templates/SectionReview",
  () => ({
    SectionReview: ({ title, children }: any) => (
      <div data-testid={`section-${title}`}>{children}</div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/changeReview/templates/ComplianceSummary",
  () => ({
    default: () => (
      <div data-testid="compliance-summary">Compliance Summary</div>
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

vi.mock("@reporting/src/app/components/changeReview/utils/utils", () => ({
  filterExcludedFields: vi.fn((changes) => changes),
  getSection: vi.fn((field) => {
    if (field.includes("report_operation")) return "Report Operation";
    return "Other";
  }),
  groupPersonResponsibleChanges: vi.fn((changes) => changes),
  normalizeChangeKeys: vi.fn((changes) => changes),
}));

describe("ReviewChanges", () => {
  const mockChanges: ChangeItem[] = [
    {
      field: "root['report_person_responsible']['name']",
      oldValue: "old_name",
      newValue: "new_name",
      change_type: "modified",
    },
    {
      field: "root['report_compliance_summary']['compliance_field']",
      oldValue: "old_compliance",
      newValue: "new_compliance",
      change_type: "modified",
    },
    {
      field:
        "root['facility_reports']['facility_1']['activity_data']['Some Activity']",
      oldValue: "old_facility",
      newValue: "new_facility",
      change_type: "modified",
    },
    {
      field: "root['report_electricity_import_data']['electricity_field']",
      oldValue: "old_electricity",
      newValue: "new_electricity",
      change_type: "modified",
    },
    {
      field: "root['report_new_entrant']['new_entrant_field']",
      oldValue: "old_entrant",
      newValue: "new_entrant",
      change_type: "modified",
    },
    {
      field: "root['operation_emission_summary']['emission_field']",
      oldValue: "old_emission",
      newValue: "new_emission",
      change_type: "modified",
    },
  ];

  it("renders all sections when changes are provided", () => {
    render(
      <ReviewChanges
        changes={mockChanges}
        registrationPurpose={REGULATED_OPERATION_REGISTRATION_PURPOSE}
      />,
    );

    expect(
      screen.getByTestId(
        "change-item-root['report_person_responsible']['name']",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("compliance-summary")).toBeInTheDocument();
    expect(
      screen.getByTestId("operation-emission-summary"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("electricity-import-data")).toBeInTheDocument();
    expect(screen.getByTestId("new-entrant-changes")).toBeInTheDocument();
    // Facility section rendered via SectionReview
    expect(
      screen.getByTestId("section-Report Information - facility_1"),
    ).toBeInTheDocument();
    // Activity diff rendered inside facility section
    expect(screen.getByTestId("simple-activity-diff")).toBeInTheDocument();
  });

  it("renders empty state when no changes are provided", () => {
    render(
      <ReviewChanges
        changes={[]}
        registrationPurpose={REGULATED_OPERATION_REGISTRATION_PURPOSE}
      />,
    );
    expect(
      screen.getByText(
        "No changes detected between the selected report versions.",
      ),
    ).toBeInTheDocument();
  });

  it("only renders sections that have changes", () => {
    const limitedChanges: ChangeItem[] = [
      {
        field: "root['report_information']['test_field']",
        oldValue: "oldValue",
        newValue: "newValue",
        change_type: "modified",
      },
    ];

    render(
      <ReviewChanges
        changes={limitedChanges}
        registrationPurpose={REGULATED_OPERATION_REGISTRATION_PURPOSE}
      />,
    );

    expect(screen.queryByTestId("compliance-summary")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("operation-emission-summary"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("electricity-import-data"),
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("new-entrant-changes")).not.toBeInTheDocument();
  });

  it("renders FacilityReportSection for a whole-facility addition", () => {
    const addedFacilityChanges: ChangeItem[] = [
      {
        field: "root['facility_reports']['New Facility']",
        oldValue: null,
        newValue: { facility_name: "New Facility", activity_data: {} },
        change_type: "added",
      },
    ];

    render(
      <ReviewChanges
        changes={addedFacilityChanges}
        registrationPurpose={REGULATED_OPERATION_REGISTRATION_PURPOSE}
      />,
    );

    expect(
      screen.getByTestId("facility-section-New Facility"),
    ).toBeInTheDocument();
    expect(screen.getByText(/added/)).toBeInTheDocument();
  });
});
