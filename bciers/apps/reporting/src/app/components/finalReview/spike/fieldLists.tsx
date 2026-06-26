import { Table, TableBody, TableRow } from "@mui/material";
import { DataCell, LabelCell } from "./FinalReviewTable";

export const mappings: Record<string, string> = {
  unitName: "Unit Name",
  gscUnitName: "Unit Name",
  gscUnitType: "Unit Type",
  gscUnitDescription: "Unit Description",
  fuelDescription: "Fuel Description",
  annualFuelAmount: "Annual Fuel Amount",
  fuelType: "Fuel Type",
  fuelClassification: "Fuel Classification",

  initial_compliance_period: "Initial Compliance Period",
  compliance_period: "Compliance Period",
  reduction_factor: "Reduction Factor",
  tightening_rate: "Tightening Rate",
  annual_production: "Annual Production",
  jan_mar_production: "January-March Production",
  apr_dec_production: "April-December Production",
  emission_intensity: "Production-weighted Average Emission Intensity",
  allocated_industrial_process_emissions:
    "Allocated Industrial Process Emissions",
  allocated_compliance_emissions:
    "Allocated Emissions Attributable For Compliance",
};
export const camelToTitleCase = (str: string) => {
  return (
    str.charAt(0).toUpperCase() +
    str
      .slice(1)
      .replace(/([A-Z])/g, " $1")
      .trim()
  );
};
export const mapFieldLabel = (fieldLabel: string) => {
  return mappings[fieldLabel] || camelToTitleCase(fieldLabel);
};
export const byLabel = (order: string[]) => {
  const reverseOrder = [...order].reverse();
  return (a: [string, unknown], b: [string, unknown]) => {
    const aIndex = reverseOrder.indexOf(a[0]);
    const bIndex = reverseOrder.indexOf(b[0]);
    if ((aIndex === -1 && bIndex === -1) || aIndex === bIndex) return 0;
    if (aIndex > bIndex) return -1;
    return 1;
  };
};

export const renderFieldList = (
  fieldList: [string, unknown][],
  variant: "default" | "compact" = "compact",
) => {
  if (fieldList.length === 0) return null;

  return (
    <Table size="small">
      <TableBody>
        {fieldList.map(([k, v], index) => {
          if (k === "divider")
            return (
              <TableRow key={`actfield-${k}-${index}`} sx={{ height: "1em" }} />
            );
          return (
            <TableRow
              key={`actfield-${k}-${index}`}
              sx={{ borderBottom: "1px solid #F2F2F2" }}
            >
              <LabelCell variant={variant} label={mapFieldLabel(k) || ""} />
              <DataCell
                variant={variant}
                data={JSON.stringify(v).replace(/(^"|"$)/g, "")}
              />
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export const excludeFromEntries = (keys: string[]) => {
  return (entry: [string, unknown]) => {
    return !keys.includes(entry[0]);
  };
};
