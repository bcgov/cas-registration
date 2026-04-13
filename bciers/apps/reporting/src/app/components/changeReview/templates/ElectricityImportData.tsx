import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";

const LABELS: Record<string, string> = {
  import_specified_electricity:
    "Amount of imported electricity - specified sources (GWh)",
  import_specified_emissions: "Emissions from specified imports (tCO₂e)",
  import_unspecified_electricity:
    "Amount of imported electricity - unspecified sources (GWh)",
  import_unspecified_emissions: "Emissions from unspecified imports (tCO₂e)",
  export_specified_electricity:
    "Amount of exported electricity - specified sources (GWh)",
  export_specified_emissions: "Emissions from specified exports (tCO₂e)",
  export_unspecified_electricity:
    "Amount of exported electricity - unspecified sources (GWh)",
  export_unspecified_emissions: "Emissions from unspecified exports (tCO₂e)",
  canadian_entitlement_electricity:
    "Amount of electricity categorized as Canadian Entitlement Power (GWh)",
  canadian_entitlement_emissions:
    "Emissions from Canadian Entitlement Power (tCO₂e)",
};

const ElectricityImportData: React.FC<{ changes: any[] }> = ({ changes }) => {
  if (!changes?.length) return null;
  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Electricity Import Data
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {changes.map((item, idx) => {
        const key = item.field.match(/\['([^']+)'\]$/)?.[1];
        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{ ...item, displayLabel: LABELS[key] ?? key }}
          />
        );
      })}
    </Box>
  );
};

export default ElectricityImportData;
