import { ChangeItem } from "../constants/types";

// Enhanced field labels mapping
export const fieldLabels: Record<string, string> = {
  activity: "Activity Name",
  source_type: "Source Type",
  emission_category: "Emission Category",
  gas_type: "Gas Type",
  gasType: "Gas Type",
  emission: "Emission",
  equivalentEmission: "Equivalent Emission",
  gscUnitName: "Unit Name",
  gscUnitType: "Unit Type",
  gscUnitDescription: "Unit Description",
  fuel_type: "Fuel Type",
  fuelType: "Fuel Type",
  fuelName: "Fuel Name",
  fuelUnit: "Fuel Unit",
  fuelClassification: "Fuel Classification",
  fuelDescription: "Fuel Description",
  annualFuelAmount: "Annual Fuel Amount",
  methodology: "Methodology",
  boilerRatio: "Boiler Ratio",
  unitFuelAnnualSteamGenerated: "Unit Fuel Annual Steam Generated",
  unitFuelCo2MeasuredSteamDefaultEf: "Unit Fuel CO2 Measured Steam Default EF",
  unitFuelCo2MeasuredSteamDefaultEfFieldUnits:
    "Unit Fuel CO2 Measured Steam Default EF Field Units",
  annual_production: "Annual Production",
  production_data_apr_dec: "Production Data for Apr 1 - Dec 31 2024",
  attributable_for_reporting: "Attributable For Reporting",
  attributable_for_reporting_threshold: "Attributable For Reporting Threshold",
  reporting_only_emission: "Reporting Only Emission",
  emission_total: "Emission Total",
  allocated_quantity: "Allocated Quantity",
  facility_total_emissions: "Facility Total Emissions",
  facility_name: "Facility Name",
  flaring: "Flaring emissions",
  fugitive: "Fugitive emissions",
  industrial_process: "Industrial process emissions",
  onsite_transportation: "On-site transportation emissions",
  stationary_combustion: "Stationary fuel combustion emissions",
  venting_useful: "Venting emissions - useful",
  venting_non_useful: "Venting emissions - non-useful",
  waste: "Emissions from waste",
  wastewater: "Emissions from wastewater",
  woody_biomass: "CO2 emissions from excluded woody biomass",
  excluded_biomass: "Other emissions from excluded biomass",
  excluded_non_biomass: "Emissions from excluded non-biomass",
  lfo_excluded:
    "Emissions from line tracing and non-processing and non-compression activities",
  first_name: "First Name",
  last_name: "Last Name",
  position_title: "Job Title / Position",
  email: "Business Email Address",
  phone_number: "Business Telephone Number",
  street_address: "Business Mailing Address",
  municipality: "Municipality",
  province: "Province",
  postal_code: "Postal Code",
  is_supplementary_report: "Is Supplementary Report",
  is_latest_submitted: "Is Latest Submitted",
  status: "Status",
  reporting_year: "Reporting Year",
  submission_date: "Submission Date",
  created_at: "Created Date",
  updated_at: "Updated Date",
};

/**
 * Generate a human-readable label from a field key
 */
export function generateDynamicLabel(fieldKey: string): string {
  if (fieldLabels[fieldKey]) {
    return fieldLabels[fieldKey];
  }

  return fieldKey
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Get section name from field path
 */
export function getSection(field: string): string {
  if (field.includes("['report_operation']")) return "Report Operation";
  if (field.includes("['report_person_responsible']"))
    return "Person Responsible";
  if (field.includes("['report_additional_data']")) return "Additional Data";
  if (field.includes("['report_compliance_summary']"))
    return "Compliance Summary";
  if (field.includes("['facility_reports']")) return "Facility Reports";

  if (
    field.includes("['is_supplementary_report']") ||
    field.includes("['is_latest_submitted']") ||
    field.includes("['status']") ||
    field.includes("['reporting_year']") ||
    field.includes("['submission_date']") ||
    field.includes("['created_at']") ||
    field.includes("['updated_at']")
  ) {
    return "Report Information";
  }

  return "Other";
}
/**
 * Get field label from path
 */
export function getLabel(field: string): string {
  const parts = field.split("']['");
  const lastPart = parts[parts.length - 1]?.replace("']", "");

  if (field.includes("['fuelType']")) {
    const fuelTypeParts = field.split("']['fuelType']['");
    if (fuelTypeParts.length > 1) {
      const fuelTypeField = fuelTypeParts[1].replace("']", "");
      return generateDynamicLabel(fuelTypeField);
    }
  }

  if (field.includes("['methodology']")) {
    const methodologyParts = field.split("']['methodology']['");
    if (methodologyParts.length > 1) {
      const methodologyField = methodologyParts[1].replace("']", "");
      return generateDynamicLabel(methodologyField);
    }
  }

  if (field.includes("['report_person_responsible']")) {
    if (field.includes("['first_name']") || field.includes("['last_name']")) {
      return "Name";
    }
  }

  return generateDynamicLabel(lastPart || field);
}

/**
 * Get simplified field label based on context
 */
export function getContextualLabel(field: string, context?: string): string {
  if (context === "facility_report") {
    const parts = field.split("']['");
    const lastPart = parts[parts.length - 1]?.replace("']", "");

    const specificFields = [
      "gas_type",
      "activity",
      "facility_name",
      "attributable_for_reporting",
      "attributable_for_reporting_threshold",
      "reporting_only_emission",
      "stationary_combustion",
      "emission_total",
      "allocated_quantity",
      "facility_total_emissions",
    ];

    for (const specificField of specificFields) {
      if (field.includes(`['${specificField}']`)) {
        return (
          fieldLabels[specificField] || generateDynamicLabel(specificField)
        );
      }
    }

    return generateDynamicLabel(lastPart || field);
  }

  return getLabel(field);
}

/**
 * Group person responsible name changes
 */
export function groupPersonResponsibleChanges(
  items: ChangeItem[],
): ChangeItem[] {
  const grouped: ChangeItem[] = [];
  const nameChanges = items.filter(
    (item) =>
      item.field.includes("['first_name']") ||
      item.field.includes("['last_name']"),
  );

  if (nameChanges.length > 0) {
    const firstNameChange = nameChanges.find((item) =>
      item.field.includes("['first_name']"),
    );
    const lastNameChange = nameChanges.find((item) =>
      item.field.includes("['last_name']"),
    );

    const combinedNameChange: ChangeItem = {
      field: "root['report_person_responsible']['name']",
      old_value: `${firstNameChange?.old_value || ""} ${
        lastNameChange?.old_value || ""
      }`.trim(),
      new_value: `${firstNameChange?.new_value || ""} ${
        lastNameChange?.new_value || ""
      }`.trim(),
    };

    grouped.push(combinedNameChange);
  }

  return grouped;
}

/**
 * Filter excluded fields
 */
export function filterExcludedFields(changes: ChangeItem[]): ChangeItem[] {
  const excludedFields = [
    "is_supplementary_report",
    "is_latest_submitted",
    "status",
    "reporting_year",
    "submission_date",
    "created_at",
    "updated_at",
  ];

  return changes.filter((change) => {
    const isExcludedField = excludedFields.some((field) =>
      change.field.includes(`['${field}']`),
    );
    return !isExcludedField;
  });
}
