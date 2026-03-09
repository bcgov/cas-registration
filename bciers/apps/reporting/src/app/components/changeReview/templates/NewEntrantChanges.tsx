import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { formatDate } from "@reporting/src/app/utils/formatDate";

const FIELD_LABELS: Record<string, string> = {
  authorization_date: "Authorization Date",
  first_shipment_date: "Date of first shipment",
  new_entrant_period_start: "Date new entrant period began",
  assertion_statement: "Assertion statement",
  production_amount: "Production after new entrant period began",
};

const BASIC_FIELDS = [
  "authorization_date",
  "first_shipment_date",
  "new_entrant_period_start",
];

// For removed items the value lives in old_value; normalise to a single "value"
const getValue = (change: any) =>
  change.change_type === "removed" ? change.oldValue : change.newValue;

const getEmissionName = (field: string) =>
  field.match(/\['report_new_entrant_emission'\]\['([^']+)'\]/)?.[1];

const getProductName = (field: string) =>
  field.match(/\['productions'\]\['([^']+)'\]/)?.[1];

const renderEmission = (change: any) => {
  const value = getValue(change);
  // Whole emission object added/removed: { emission_category, emission }
  const emission = typeof value === "object" ? value?.emission : value;
  const label =
    typeof value === "object"
      ? value?.emission_category
      : getEmissionName(change.field);
  return (
    <ChangeItemDisplay
      item={{
        field: change.field,
        oldValue:
          change.change_type === "removed"
            ? emission
            : (change.oldValue ?? null),
        newValue:
          change.change_type === "added"
            ? emission
            : change.change_type === "modified"
              ? change.newValue
              : null,
        change_type: change.change_type,
        displayLabel: label,
      }}
    />
  );
};

interface NewEntrantChangesProps {
  changes: any[];
}

const NewEntrantChanges: React.FC<NewEntrantChangesProps> = ({ changes }) => {
  if (!changes?.length) return null;

  // Drop internal category metadata fields — they're surfaced via emission_category label
  const filtered = changes.filter(
    (c) =>
      !c.field.endsWith("['emission_category']") &&
      !c.field.endsWith("['category_type']"),
  );

  const basicFields = BASIC_FIELDS.map((key) =>
    filtered.find((c) => c.field.includes(key)),
  ).filter(Boolean);
  const emissions = filtered.filter((c) => getEmissionName(c.field));
  const products: Record<string, { production?: any; emissions: any[] }> = {};

  filtered
    .filter((c) => getProductName(c.field))
    .forEach((c) => {
      const name = getProductName(c.field)!;
      products[name] = products[name] || { emissions: [] };
      const isWholeObject = typeof getValue(c) === "object";
      products[name].production = isWholeObject
        ? {
            ...c,
            oldValue: c.oldValue?.production_amount ?? null,
            newValue: c.newValue?.production_amount ?? null,
          }
        : c.field.includes("production_amount")
          ? c
          : undefined;
      if (!isWholeObject && !c.field.includes("production_amount"))
        products[name].emissions.push(c);
    });

  const standaloneEmissions = emissions.filter((c) => !getProductName(c.field));

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Report New Entrant Information
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {basicFields.map((item: any) => {
        const key = item.field.match(/\['([a-zA-Z0-9_]+)'\]$/)?.[1];
        const fmt = (v: any) => (v ? formatDate(v, "YYYY-MM-DD") : v);
        return (
          <Box key={item.field} mb={1}>
            <ChangeItemDisplay
              item={{
                ...item,
                oldValue: fmt(item.oldValue),
                newValue: fmt(item.newValue),
                displayLabel: FIELD_LABELS[key] ?? key,
              }}
            />
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
              <ChangeItemDisplay
                item={{
                  ...data.production,
                  displayLabel: FIELD_LABELS.production_amount,
                }}
              />
            </Box>
          )}
          {data.emissions.map((item) => (
            <Box key={item.field} mb={1}>
              {renderEmission(item)}
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
              {renderEmission(item)}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NewEntrantChanges;
