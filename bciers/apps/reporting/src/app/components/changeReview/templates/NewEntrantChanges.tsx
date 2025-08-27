import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { formatDate } from "@reporting/src/app/utils/formatDate";

const newEntrantFieldLabels: Record<string, string> = {
  authorization_date: "Authorization Date",
  first_shipment_date: "Date of first shipment",
  new_entrant_period_start: "Date new entrant period began",
  assertion_statement: "Assertion statement",
  production_amount: "Production after new entrant period began",
  unit: "Unit",
  emission: "Emission",
};

const BASIC_FIELD_ORDER = [
  "authorization_date",
  "first_shipment_date",
  "new_entrant_period_start",
];

// Extract product/emission names from field path
const parseFieldPath = (field: string) => ({
  productName: field.match(/\['productions'\]\['([^']+)'\]/)?.[1],
  emissionName: field.match(
    /\['report_new_entrant_emission'\]\['([^']+)'\]/,
  )?.[1],
});

// Group changes by type
const groupChanges = (changes: any[]) => {
  const basicFields: any[] = [];
  const products: Record<string, { production?: any; emissions: any[] }> = {};
  const standaloneEmissions: any[] = [];
  changes.forEach((change) => {
    const { productName, emissionName } = parseFieldPath(change.field);
    if (BASIC_FIELD_ORDER.some((key) => change.field.includes(key)))
      basicFields.push(change);
    else if (productName && change.field.includes("production_amount")) {
      products[productName] = products[productName] || { emissions: [] };
      products[productName].production = change;
    } else if (emissionName) {
      if (productName) {
        products[productName] = products[productName] || { emissions: [] };
        products[productName].emissions.push({ ...change, emissionName });
      } else {
        standaloneEmissions.push({ ...change, emissionName });
      }
    }
  });
  return { basicFields, products, standaloneEmissions };
};

// Deduplicate and order basic fields
const getOrderedBasicFields = (basicFields: any[]) => {
  const seen = new Set<string>();
  return BASIC_FIELD_ORDER.map((key) =>
    basicFields.find((f) => f.field.includes(key)),
  )
    .filter(Boolean)
    .filter((item) => {
      const label =
        newEntrantFieldLabels[item.field.match(/\['([^']+)'\]$/)?.[1]] ||
        item.field;
      if (seen.has(label)) return false;
      seen.add(label);
      return true;
    })
    .filter(
      (item, idx, arr) => arr.findIndex((i) => i.field === item.field) === idx,
    );
};

// Render value using ChangeItemDisplay
const renderValue = (
  change: any,
  label?: string,
  formatDateField?: boolean,
) => {
  // Format basic field date values if requested
  let formattedChange = change;
  if (formatDateField && change.newValue) {
    formattedChange = {
      ...change,
      newValue: formatDate(change.newValue, "YYYY-MM-DD"),
      oldValue: change.oldValue
        ? formatDate(change.oldValue, "YYYY-MM-DD")
        : change.oldValue,
    };
  }
  if (
    (formattedChange.change_type === "added" ||
      formattedChange.change_type === "deleted") &&
    typeof formattedChange.newValue === "object" &&
    formattedChange.newValue?.emission_category &&
    formattedChange.newValue?.emission !== undefined
  ) {
    return (
      <ChangeItemDisplay
        item={{
          field: formattedChange.newValue.emission_category,
          oldValue: formattedChange.oldValue?.emission ?? null,
          newValue: formattedChange.newValue.emission,
          change_type: formattedChange.change_type,
          displayLabel: formattedChange.newValue.emission_category,
          isNewAddition: formattedChange.change_type === "added",
        }}
      />
    );
  }
  if (
    formattedChange.change_type === "added" &&
    typeof formattedChange.newValue === "object" &&
    formattedChange.newValue !== null
  ) {
    return (
      <Box sx={{ pl: 2 }}>
        {Object.entries(formattedChange.newValue).map(([k, v]) => (
          <ChangeItemDisplay
            key={k}
            item={{
              field: k,
              oldValue: null,
              newValue:
                typeof v === "string" || typeof v === "object" ? v : String(v),
              change_type: "added",
              displayLabel: k,
            }}
          />
        ))}
      </Box>
    );
  }
  return (
    <ChangeItemDisplay
      item={{
        ...formattedChange,
        displayLabel: label || formattedChange.field,
      }}
    />
  );
};

interface NewEntrantChangesProps {
  changes: any[];
}

const NewEntrantChanges: React.FC<NewEntrantChangesProps> = ({ changes }) => {
  if (!changes?.length) return null;
  const { basicFields, products, standaloneEmissions } = groupChanges(changes);
  const orderedBasicFields = getOrderedBasicFields(basicFields);

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Report New Entrant Information
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {orderedBasicFields.map((item) => {
        // Extract key for label mapping
        const keyMatch = item.field.match(/\['([a-zA-Z0-9_]+)'\]$/);
        const key = keyMatch ? keyMatch[1] : undefined;
        const label = key ? newEntrantFieldLabels[key] : item.field;
        return (
          <Box key={item.field} mb={1}>
            {renderValue(
              item,
              label,
              true, // format date for basic fields
            )}
          </Box>
        );
      })}
      {Object.entries(products).map(([productName, data]) => (
        <Box key={productName} mb={3}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
            Product: {productName}
          </Typography>
          {data.production && (
            <Box mb={1}>
              {renderValue(
                data.production,
                newEntrantFieldLabels.production_amount,
              )}
            </Box>
          )}
          {data.emissions.map((item) => (
            <Box key={item.field} mb={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                {item.emissionName}
              </Typography>
              {renderValue(item, item.emissionName)}
            </Box>
          ))}
        </Box>
      ))}
      {standaloneEmissions.length > 0 && (
        <Box mb={3}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
            Emissions
          </Typography>
          {standaloneEmissions.map((item) => (
            <Box key={item.field} mb={1}>
              {renderValue(item, item.emissionName)}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NewEntrantChanges;
