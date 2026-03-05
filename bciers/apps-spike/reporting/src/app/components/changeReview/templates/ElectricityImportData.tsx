import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";

interface ElectricityImportDataProps {
  changes: any[];
}

const ElectricityImportData: React.FC<ElectricityImportDataProps> = ({
  changes,
}) => {
  if (changes.length === 0) return null;

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Electricity Import Data
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {changes.map((item, idx) => {
        const key = item.field
          .split("root['report_electricity_import_data'][0]['")[1]
          ?.replace("']", "");

        let label = "";
        if (key?.includes("import_specified")) {
          label = key.includes("electricity")
            ? "Amount of imported electricity - specified sources"
            : "Emissions from specified imports";
        } else if (key?.includes("import_unspecified")) {
          label = key.includes("electricity")
            ? "Amount of imported electricity - unspecified sources"
            : "Emissions from unspecified imports";
        } else if (key?.includes("export_specified")) {
          label = key.includes("electricity")
            ? "Amount of exported electricity - specified sources"
            : "Emissions from specified exports";
        } else if (key?.includes("export_unspecified")) {
          label = key.includes("electricity")
            ? "Amount of exported electricity - unspecified sources"
            : "Emissions from unspecified exports";
        } else if (key?.includes("canadian_entitlement")) {
          label = key.includes("electricity")
            ? "Amount of electricity categorized as Canadian Entitlement Power"
            : "Emissions from Canadian Entitlement Power";
        }

        const unit = key?.includes("electricity") ? "GWh" : "tCO₂e";

        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{
              ...item,
              displayLabel: `${label} (${unit})`,
            }}
          />
        );
      })}
    </Box>
  );
};

export default ElectricityImportData;
