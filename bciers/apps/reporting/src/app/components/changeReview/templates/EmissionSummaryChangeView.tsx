import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { ChangeItem } from "../constants/types";

const SECTIONS = [
  {
    heading: undefined,
    fields: [
      "attributable_for_reporting",
      "attributable_for_reporting_threshold",
    ],
  },
  {
    heading: "Emission Categories",
    fields: [
      "emission_categories.flaring",
      "emission_categories.fugitive",
      "emission_categories.industrial_process",
      "emission_categories.onsite_transportation",
      "emission_categories.stationary_combustion",
      "emission_categories.venting_useful",
      "emission_categories.venting_non_useful",
      "emission_categories.waste",
      "emission_categories.wastewater",
    ],
  },
  {
    heading: "Emissions excluded by fuel type",
    fields: [
      "fuel_excluded.woody_biomass",
      "fuel_excluded.excluded_biomass",
      "fuel_excluded.excluded_non_biomass",
    ],
  },
  {
    heading: "Other excluded emissions",
    fields: ["other_excluded.lfo_excluded"],
  },
];

const FIELD_LABELS: Record<string, string> = {
  attributable_for_reporting: "Emissions attributable for reporting",
  attributable_for_reporting_threshold:
    "Emissions attributable for reporting threshold",
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
  "fuel_excluded.woody_biomass": "CO2 emissions from excluded woody biomass",
  "fuel_excluded.excluded_biomass": "Other emissions from excluded biomass",
  "fuel_excluded.excluded_non_biomass": "Emissions from excluded non-biomass",
  "other_excluded.lfo_excluded":
    "Emissions from line tracing and non-processing and non-compression activities",
};

// Extract the dotted field key from a flat path like ...['emission_summary']['emission_categories']['flaring']
const getFieldKey = (field: string): string => {
  const after = field.split("emission_summary']['")[1];
  if (!after) return "";
  return after.replaceAll(/'\]\['/g, ".").replaceAll(/['[\]]/g, "");
};

export const EmissionSummaryChangeView: React.FC<{ data: ChangeItem[] }> = ({
  data,
}) => {
  const sections = SECTIONS.map((section) => ({
    ...section,
    changes: data
      .map((change) => ({ change, key: getFieldKey(change.field) }))
      .filter(({ key }) => section.fields.includes(key))
      .map(({ change, key }) => ({
        ...change,
        displayLabel: FIELD_LABELS[key] ?? key,
      })),
  })).filter((s) => s.changes.length > 0);

  if (!sections.length) return null;

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue mb-4">
        Emissions Summary (in tCO2e)
      </Typography>
      {sections.map((section, idx) => (
        <React.Fragment key={`section-${idx}`}>
          {section.heading && (
            <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
              {section.heading}
            </Typography>
          )}
          {section.changes.map((change, cIdx) => (
            <ChangeItemDisplay key={`${change.field}-${cIdx}`} item={change} />
          ))}
          {idx < sections.length - 1 && <Divider sx={{ my: 3 }} />}
        </React.Fragment>
      ))}
    </Box>
  );
};
