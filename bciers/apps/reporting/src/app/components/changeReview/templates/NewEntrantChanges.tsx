import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";

const newEntrantFieldLabels: Record<string, string> = {
  authorization_date: "Authorization Date",
  first_shipment_date: "Date of first shipment",
  new_entrant_period_start: "Date new entrant period began",
  assertion_statement: "Assertion statement",
  production_amount: "Production after new entrant period began",
  unit: "Unit",
  emission: "Emission",
};

interface NewEntrantChangesProps {
  changes: any[];
}

const NewEntrantChanges: React.FC<NewEntrantChangesProps> = ({ changes }) => {
  if (changes.length === 0) return null;

  const getNewEntrantFieldDetails = (field: string) => {
    // Handle emissions fields
    const emissionMatch = field.match(
      /\['report_new_entrant_emission']\[(\d+)]\['([^']+)']$/,
    );
    if (emissionMatch) {
      const index = parseInt(emissionMatch[1], 10);
      const fieldName = emissionMatch[2];
      return {
        type: "emission",
        index,
        fieldName,
        label: newEntrantFieldLabels[fieldName] || fieldName,
      };
    }

    // Handle production fields
    const productionMatch = field.match(
      /\['productions']\[(\d+)]\['([^']+)']$/,
    );
    if (productionMatch) {
      const index = parseInt(productionMatch[1], 10);
      const fieldName = productionMatch[2];
      return {
        type: "production",
        index,
        fieldName,
        label: newEntrantFieldLabels[fieldName] || fieldName,
      };
    }

    // Handle basic new entrant fields
    const basicFieldMatch = field.match(/\['([^']+)']$/);
    if (basicFieldMatch) {
      const fieldName = basicFieldMatch[1];
      return {
        type: "basic",
        fieldName,
        label: newEntrantFieldLabels[fieldName] || fieldName,
      };
    }

    return null;
  };

  // Group changes by type and index
  const groupedChanges: {
    basic: any[];
    productions: Record<string, any[]>;
    emissions: Record<string, any[]>;
  } = {
    basic: [],
    productions: {},
    emissions: {},
  };

  changes.forEach((change) => {
    const fieldInfo = getNewEntrantFieldDetails(change.field);

    if (fieldInfo?.type === "basic") {
      groupedChanges.basic.push({ ...change, fieldInfo });
    } else if (fieldInfo?.type === "production") {
      const key = `production_${fieldInfo.index}`;
      if (!groupedChanges.productions[key]) {
        groupedChanges.productions[key] = [];
      }
      groupedChanges.productions[key].push({ ...change, fieldInfo });
    } else if (fieldInfo?.type === "emission") {
      const key = `emission_${fieldInfo.index}`;
      if (!groupedChanges.emissions[key]) {
        groupedChanges.emissions[key] = [];
      }
      groupedChanges.emissions[key].push({ ...change, fieldInfo });
    }
  });

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Report New Entrant Information
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Basic fields */}
      {groupedChanges.basic.map((item, idx) => (
        <ChangeItemDisplay
          key={item.field + idx}
          item={{
            ...item,
            displayLabel: item.fieldInfo?.label || item.field,
          }}
        />
      ))}

      {/* Production data */}
      {Object.entries(groupedChanges.productions).map(
        ([key, productionChanges]) => {
          if (productionChanges.length === 0) return null;

          const index = key.split("_")[1];
          const productName = `Product ${parseInt(index) + 1}`;

          return (
            <Box key={key} mb={2}>
              <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
                {productName}
              </Typography>
              {productionChanges.map((item, idx) => (
                <ChangeItemDisplay
                  key={item.field + idx}
                  item={{
                    ...item,
                    displayLabel: item.fieldInfo?.label || item.field,
                  }}
                />
              ))}
            </Box>
          );
        },
      )}

      {/* Emission data */}
      {Object.entries(groupedChanges.emissions).map(
        ([key, emissionChanges]) => {
          if (emissionChanges.length === 0) return null;

          const index = key.split("_")[1];

          return (
            <Box key={key} mb={2}>
              <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
                Emission Category {parseInt(index) + 1}
              </Typography>
              {emissionChanges.map((item, idx) => (
                <ChangeItemDisplay
                  key={item.field + idx}
                  item={{
                    ...item,
                    displayLabel: item.fieldInfo?.label || item.field,
                  }}
                />
              ))}
            </Box>
          );
        },
      )}
    </Box>
  );
};

export default NewEntrantChanges;
