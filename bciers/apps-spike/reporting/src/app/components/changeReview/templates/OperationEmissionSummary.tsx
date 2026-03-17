import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";

const operationEmissionSummaryLabels: Record<string, string> = {
  attributable_for_reporting: "Emissions attributable for reporting",
  attributable_for_reporting_threshold:
    "Emissions attributable for reporting threshold",
  reporting_only_emission: "Reporting only emissions",
  // Emission categories
  "emission_categories.flaring": "Flaring emissions",
  "emission_categories.fugitive": "Fugitive emissions",
  "emission_categories.industrial_process": "Industrial process emissions",
  "emission_categories.onsite_transportation":
    "On-site transportation emissions",
  "emission_categories.stationary_combustion":
    "Stationary fuel combustion emissions",
  "emission_categories.venting_useful": "Venting emissions - useful",
  "emission_categories.venting_non_useful": "Venting emissions - non-useful",
  "emission_categories.waste": "Emissions from waste",
  "emission_categories.wastewater": "Emissions from wastewater",
  // Fuel excluded emissions
  "fuel_excluded.woody_biomass": "CO2 emissions from excluded woody biomass",
  "fuel_excluded.excluded_biomass": "Other emissions from excluded biomass",
  "fuel_excluded.excluded_non_biomass": "Emissions from excluded non-biomass",
  // Other excluded emissions
  "other_excluded.lfo_excluded":
    "Emissions from line tracing and non-processing and non-compression activities",
};

interface OperationEmissionSummaryProps {
  changes: any[];
}

const OperationEmissionSummary: React.FC<OperationEmissionSummaryProps> = ({
  changes,
}) => {
  if (changes.length === 0) return null;

  const getFieldDetails = (field: string) => {
    const nestedMatch = field.match(
      /root\['operation_emission_summary'\]\['([^']+)'\]\['([^']+)'\]$/,
    );
    if (nestedMatch) {
      const category = nestedMatch[1];
      const subField = nestedMatch[2];
      const fullKey = `${category}.${subField}`;
      return {
        label:
          operationEmissionSummaryLabels[fullKey] || `${category} ${subField}`,
      };
    }

    const directMatch = field.match(
      /root\['operation_emission_summary'\]\['([^']+)'\]$/,
    );
    if (directMatch) {
      const fieldName = directMatch[1];
      return { label: operationEmissionSummaryLabels[fieldName] || fieldName };
    }

    const fieldMatch = field.match(/\['([^']+)']$/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      return { label: operationEmissionSummaryLabels[fieldName] || fieldName };
    }

    return { label: field };
  };

  // Group changes by category
  const groupedChanges = {
    main: [] as any[],
    emissionCategories: [] as any[],
    fuelExcluded: [] as any[],
    otherExcluded: [] as any[],
  };

  changes.forEach((item) => {
    if (item.field.includes("['emission_categories']")) {
      groupedChanges.emissionCategories.push(item);
    } else if (item.field.includes("['fuel_excluded']")) {
      groupedChanges.fuelExcluded.push(item);
    } else if (item.field.includes("['other_excluded']")) {
      groupedChanges.otherExcluded.push(item);
    } else {
      groupedChanges.main.push(item);
    }
  });

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Operation Emission Summary (In tCO₂e)
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Main fields */}
      {groupedChanges.main.map((item, idx) => {
        const fieldInfo = getFieldDetails(item.field);
        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{ ...item, displayLabel: fieldInfo.label }}
          />
        );
      })}

      {/* Emission Categories */}
      {groupedChanges.emissionCategories.length > 0 && (
        <Box mt={3} mb={2}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
            Emission Categories
          </Typography>
          {groupedChanges.emissionCategories.map((item, idx) => {
            const fieldInfo = getFieldDetails(item.field);
            return (
              <ChangeItemDisplay
                key={item.field + idx}
                item={{ ...item, displayLabel: fieldInfo.label }}
              />
            );
          })}
        </Box>
      )}

      {/* Emissions excluded by fuel type */}
      {groupedChanges.fuelExcluded.length > 0 && (
        <Box mt={3} mb={2}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
            Emissions excluded by fuel type
          </Typography>
          {groupedChanges.fuelExcluded.map((item, idx) => {
            const fieldInfo = getFieldDetails(item.field);
            return (
              <ChangeItemDisplay
                key={item.field + idx}
                item={{ ...item, displayLabel: fieldInfo.label }}
              />
            );
          })}
        </Box>
      )}

      {/* Other emissions excluded */}
      {groupedChanges.otherExcluded.length > 0 && (
        <Box mt={3} mb={2}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
            Other emissions excluded
          </Typography>
          {groupedChanges.otherExcluded.map((item, idx) => {
            const fieldInfo = getFieldDetails(item.field);
            return (
              <ChangeItemDisplay
                key={item.field + idx}
                item={{ ...item, displayLabel: fieldInfo.label }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default OperationEmissionSummary;
