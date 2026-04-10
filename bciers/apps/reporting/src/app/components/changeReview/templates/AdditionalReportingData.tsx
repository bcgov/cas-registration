import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { ChangeItem } from "../constants/types";

const FIELD_LABELS: Record<string, string> = {
  capture_emissions: "Did you capture emissions?",
  emissions_on_site_use: "Emissions (t) captured for on-site use",
  emissions_on_site_sequestration:
    "Emissions (t) captured for on-site sequestration",
  emissions_off_site_transfer: "Emissions (t) captured for off-site transfer",
  electricity_generated: "Electricity Generated (GWh)",
  unknown: "Unknown field",
};

const AdditionalReportingData: React.FC<{ changes: ChangeItem[] }> = ({
  changes,
}) => {
  if (!changes.length) return null;
  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Additional Reporting Data
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {changes.map((item, idx) => {
        const key = item.field.match(/\['([^']+)'\]$/)?.[1] ?? "unknown";
        const label = FIELD_LABELS[key];
        if (!label) return null;
        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{ ...item, displayLabel: label }}
          />
        );
      })}
    </Box>
  );
};

export { FIELD_LABELS as additionalDataFields };
export default AdditionalReportingData;
