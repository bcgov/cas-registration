import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";

interface AdditionalReportingDataProps {
  changes: any[];
}

export const additionalDataFields = [
  { label: "Did you capture emissions?", key: "capture_emissions" },
  {
    label: "Emissions (t) captured for on-site use",
    key: "emissions_on_site_use",
  },
  {
    label: "Emissions (t) captured for on-site sequestration",
    key: "emissions_on_site_sequestration",
  },
  {
    label: "Emissions (t) captured for off-site transfer",
    key: "emissions_off_site_transfer",
  },
  { heading: "Additional data" },
  { label: "Electricity Generated", key: "electricity_generated", unit: "GWh" },
];

const AdditionalReportingData: React.FC<AdditionalReportingDataProps> = ({
  changes,
}) => {
  if (!changes || changes.length === 0) return null;

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Additional Reporting Data
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {changes.map((item, idx) => {
        // Extract all keys from the field path
        const keyMatches = item.field.match(/\['([^']+)'\]/g);
        const keys = keyMatches?.map((k: string) => k.replace(/[\['\]]/g, ""));

        // Use the second key as the field under 'report_additional_data'
        const key = keys?.[1];
        if (!key) return null;

        // Find the corresponding label and unit
        const fieldDef = additionalDataFields.find((f) => f.key === key);
        if (!fieldDef) return null;

        const label = fieldDef.label || key;
        const unit = fieldDef.unit ? ` (${fieldDef.unit})` : "";
        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{
              ...item,
              displayLabel: `${label}${unit}`,
            }}
          />
        );
      })}
    </Box>
  );
};

export default AdditionalReportingData;
