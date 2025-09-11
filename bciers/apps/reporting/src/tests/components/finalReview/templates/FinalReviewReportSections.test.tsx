import { render, screen } from "@testing-library/react";
import React from "react";
import { FinalReviewReportSections } from "@reporting/src/app/components/finalReview/templates/FinalReviewReportSections";
import { OperationTypes } from "@bciers/utils/src/enums";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

vi.mock(
  "@reporting/src/app/components/finalReview/templates/SectionReview",
  () => ({
    SectionReview: ({
      title,
      children,
    }: {
      title: string;
      children: React.ReactNode;
    }) => (
      <div data-testid="section-review">
        <h3>{title}</h3>
        {children}
      </div>
    ),
  }),
);

vi.mock(
  "@reporting/src/app/components/finalReview/templates/ActivityView",
  () => ({
    default: ({ activity_data }: { activity_data: any }) => (
      <div data-testid="activities-view">
        Activities: {activity_data?.length || 0}
      </div>
    ),
  }),
);
vi.mock(
  "@reporting/src/app/components/finalReview/FinalReviewFacilityGrid",
  () => ({
    __esModule: true,
    default: () => <div>Mock Facility Grid</div>,
  }),
);

vi.mock(
  "@reporting/src/app/components/finalReview/templates/FieldDisplay",
  () => ({
    FieldDisplay: ({ label, value }: { label: string; value: any }) => (
      <div data-testid="field-display">
        {label}: {String(value)}
      </div>
    ),
  }),
);

describe("The ReportSections component", () => {
  const mockBaseData = {
    report_operation: {
      activities: "Test Activities",
      regulated_products: "Test Products",
      representatives: "Test Reps",
      operator_legal_name: "Test Legal Name",
      operator_trade_name: "Test Trade Name",
      operation_name: "Test Operation",
      operation_type: OperationTypes.SFO,
      operation_bcghgid: "123456",
      bc_obps_regulated_operation_id: "REG123",
      registration_purpose: RegistrationPurposes.OBPS_REGULATED_OPERATION,
    },
    report_person_responsible: {
      first_name: "John",
      last_name: "Doe",
      position_title: "Manager",
      business_role: "Owner",
      email: "john@example.com",
      phone_number: "555-1234",
      street_address: "123 Main St",
      municipality: "Vancouver",
      province: "BC",
      postal_code: "V6B 1A1",
    },
    facility_reports: [
      {
        facility: "facility-1",
        facility_name: "Test Facility",
        facility_type: "Large Facility",
        facility_bcghgid: "FAC123456",
        activity_data: [] as [],
        emission_summary: {
          attributable_for_reporting: "1000",
          attributable_for_reporting_threshold: "1200",
          reporting_only_emission: "500",
          emission_categories: {
            flaring: 100,
            fugitive: 50,
            industrial_process: 200,
            onsite_transportation: 75,
            stationary_combustion: 400,
            venting_useful: 25,
            venting_non_useful: 50,
            waste: 50,
            wastewater: 50,
          },
          fuel_excluded: {
            woody_biomass: 20,
            excluded_biomass: 15,
            excluded_non_biomass: 10,
          },
          other_excluded: {
            lfo_excluded: 5,
            fog_excluded: 10,
          },
        },
        report_products: [],
        reportnonattributableemissions_records: [],
        report_emission_allocation: {
          facility_total_emissions: 1000,
          report_product_emission_allocation_totals: [],
          report_product_emission_allocations: [],
          allocation_methodology: "Default Methodology",
          allocation_other_methodology_description: "Test description",
        },
      },
    ],
    report_additional_data: {
      capture_emissions: false,
      emissions_on_site_use: "100",
      emissions_on_site_sequestration: "50",
      emissions_off_site_transfer: "25",
      electricity_generated: 1000,
    },
    report_compliance_summary: {
      emissions_attributable_for_reporting: "1000",
      reporting_only_emissions: "500",
      emissions_attributable_for_compliance: "800",
      emissions_limit: "1200",
      excess_emissions: "0",
      credited_emissions: "200",
      regulatory_values: {
        reduction_factor: "0.05",
        tightening_rate: "0.02",
        initial_compliance_period: 2021,
        compliance_period: 2024,
      },
      products: [],
    },
    operation_emission_summary: {
      attributable_for_reporting: 1000,
      attributable_for_reporting_threshold: "1200",
      emission_categories: {
        flaring: 100,
        fugitive: 50,
        industrial_process: 200,
        onsite_transportation: 75,
        stationary_combustion: 400,
        venting_useful: 25,
        venting_non_useful: 50,
        waste: 50,
        wastewater: 50,
      },
      fuel_excluded: {
        woody_biomass: 20,
        excluded_biomass: 15,
        excluded_non_biomass: 10,
      },
      other_excluded: {
        lfo_excluded: 5,
        fog_excluded: 10,
      },
    },
    is_supplementary_report: false,
    report_new_entrant: [],
    report_electricity_import_data: [],
  };

  it("renders operation information section", () => {
    render(<FinalReviewReportSections data={mockBaseData} version_id={1} />);

    expect(
      screen.getByText("Review Operation Information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Person Responsible for Submitting Report"),
    ).toBeInTheDocument();
  });

  it("renders facility report information for SFO reporting only", () => {
    render(<FinalReviewReportSections data={mockBaseData} version_id={1} />);

    expect(
      screen.getByText("Report Information - Test Facility"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("activities-view")).toBeInTheDocument();
    expect(screen.getByText("Non-Attributable Emissions")).toBeInTheDocument();
    expect(
      screen.getByText("Emissions Summary (in tCO2e)"),
    ).toBeInTheDocument();
  });

  it("renders EIO specific sections for EIO operations", () => {
    const eioData = {
      ...mockBaseData,
      report_operation: {
        ...mockBaseData.report_operation,
        registration_purpose: OperationTypes.EIO,
      },
    };

    render(<FinalReviewReportSections data={eioData} version_id={1} />);

    expect(
      screen.getByText("Review Operation Information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Person Responsible for Submitting Report"),
    ).toBeInTheDocument();
  });

  it("renders LFO specific sections for LFO operations", () => {
    const lfoData = {
      ...mockBaseData,
      report_operation: {
        ...mockBaseData.report_operation,
        operation_type: OperationTypes.LFO,
        registration_purpose: RegistrationPurposes.OBPS_REGULATED_OPERATION, // Change to non-reporting flow
      },
      facility_reports: [
        {
          facility: "f486f2fb-62ed-438d-bb3e-0819b51e3aeb",
          facility_name: "Facility 1",
          id: 51,
        },
        {
          facility: "f486f2fb-62ed-438d-bb3e-0819b51e3aec",
          facility_name: "Facility 3",
          id: 52,
        },
        {
          facility: "f486f2fb-62ed-438d-bb3e-0819b51e3aed",
          facility_name: "Facility 4",
          id: 53,
        },
        {
          facility: "f486f2fb-62ed-438d-bb3e-0819b51e3aee",
          facility_name: "Facility 5",
          id: 54,
        },
        {
          facility: "f486f2fb-62ed-438d-bb3e-0819b51e3aef",
          facility_name: "Facility 6",
          id: 55,
        },
      ],
      rowCount: 5,
    };

    render(<FinalReviewReportSections data={lfoData} version_id={1} />);

    expect(
      screen.getByText("Review Operation Information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Person Responsible for Submitting Report"),
    ).toBeInTheDocument();
  });

  it("renders new entrant sections for new entrant operations", () => {
    const newEntrantData = {
      ...mockBaseData,
      report_operation: {
        ...mockBaseData.report_operation,
        registration_purpose: RegistrationPurposes.NEW_ENTRANT_OPERATION,
      },
      report_new_entrant: [
        {
          authorization_date: "2024-01-01",
          first_shipment_date: "2024-02-01",
          new_entrant_period_start: "2024-01-15",
          assertion_statement: true,
          productions: [] as [],
          report_new_entrant_emission: [] as [],
        },
      ],
    };

    render(<FinalReviewReportSections data={newEntrantData} version_id={1} />);

    expect(
      screen.getByText("Review Operation Information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Person Responsible for Submitting Report"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Report New Entrant Information"),
    ).toBeInTheDocument();
  });

  it("renders additional data section", () => {
    render(<FinalReviewReportSections data={mockBaseData} version_id={1} />);

    expect(screen.getByText("Additional Reporting Data")).toBeInTheDocument();
  });

  it("renders compliance summary section", () => {
    render(<FinalReviewReportSections data={mockBaseData} version_id={1} />);

    expect(screen.getByText("Compliance Summary")).toBeInTheDocument();
  });

  it("renders non-attributable emissions when records exist", () => {
    const dataWithNonAttributable = {
      ...mockBaseData,
      facility_reports: [
        {
          ...mockBaseData.facility_reports[0],
          reportnonattributableemissions_records: [
            {
              activity: "Test Activity",
              source_type: "Test Source Type",
              emission_category: "Test Category",
              gas_type: "CO2",
            },
          ],
        },
      ],
    };

    render(
      <FinalReviewReportSections
        data={dataWithNonAttributable}
        version_id={1}
      />,
    );

    expect(
      screen.getByText("Activity Name: Test Activity"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Source Type: Test Source Type"),
    ).toBeInTheDocument();
  });

  it("handles empty facility reports", () => {
    const dataWithoutFacilities = {
      ...mockBaseData,
      facility_reports: [],
    };

    render(
      <FinalReviewReportSections data={dataWithoutFacilities} version_id={1} />,
    );

    expect(
      screen.getByText("Review Operation Information"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Person Responsible for Submitting Report"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Report Information")).not.toBeInTheDocument();
  });
});
