import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";

const COMPLIANCE_LABELS: Record<string, string> = {
  emissions_attributable_for_reporting: "Emissions Attributable for Reporting",
  reporting_only_emissions: "Reporting Only Emissions",
  emissions_attributable_for_compliance:
    "Emissions Attributable for Compliance",
  emissions_limit: "Emissions Limit",
  excess_emissions: "Excess Emissions",
  credited_emissions: "Credited Emissions",
};

const PRODUCT_LABELS: Record<string, string> = {
  name: "Product Name",
  annual_production: "Annual Production",
  jan_mar_production: "Production data for Jan 1 - Mar 31 2025",
  apr_dec_production: "Production data for Apr 1 - Dec 31 2024",
  emission_intensity: "Emission Intensity",
  allocated_industrial_process_emissions:
    "Allocated Industrial Process Emissions",
  allocated_compliance_emissions: "Allocated Compliance Emissions",
};

const REGULATORY_LABELS: Record<string, string> = {
  "regulatory_values.reduction_factor": "Reduction factor",
  "regulatory_values.tightening_rate": "Tightening rate",
  "regulatory_values.initial_compliance_period": "Initial compliance period",
  "regulatory_values.compliance_period": "Compliance period",
};

const getProductName = (item: any) =>
  item.newValue?.name ??
  item.oldValue?.name ??
  item.field.match(/\['products']\['([^']+)']/)?.[1] ??
  "Unknown Product";

const isProductField = (field: string) => field.includes("['products']");

const skipChange = (oldVal: any, newVal: any) => {
  const o = parseFloat(oldVal),
    n = parseFloat(newVal);
  return !isNaN(o) && !isNaN(n) && o.toFixed(4) === n.toFixed(4);
};

const ComplianceSummary: React.FC<{ changes: any[] }> = ({ changes }) => {
  if (!changes?.length) return null;

  const productChanges: Record<string, any[]> = {};
  const nonProductChanges: any[] = [];

  changes.forEach((item) => {
    if (isProductField(item.field)) {
      const name = getProductName(item);
      productChanges[name] = productChanges[name] || [];
      productChanges[name].push(item);
    } else {
      nonProductChanges.push(item);
    }
  });

  let regulatoryHeadingRendered = false;

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Compliance Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {nonProductChanges.map((item, idx) => {
        const key = item.field.match(/\['([^']+)'\]$/)?.[1] ?? "";
        const regulatoryLabel = REGULATORY_LABELS[`regulatory_values.${key}`];

        if (regulatoryLabel) {
          const heading = !regulatoryHeadingRendered &&
            (regulatoryHeadingRendered = true) && (
              <Typography
                key="reg-heading"
                className="font-bold text-bc-bg-blue mt-4 mb-2"
              >
                Regulatory values
              </Typography>
            );
          return (
            <React.Fragment key={item.field + idx}>
              {heading}
              <ChangeItemDisplay
                item={{ ...item, displayLabel: regulatoryLabel }}
              />
            </React.Fragment>
          );
        }

        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{ ...item, displayLabel: COMPLIANCE_LABELS[key] ?? key }}
          />
        );
      })}

      {Object.entries(productChanges).map(([productName, items]) => {
        const first = items[0];
        const isFullChange =
          (first.change_type === "added" && first.oldValue == null) ||
          (first.change_type === "removed" && first.newValue == null);

        if (isFullChange) {
          const data =
            first.change_type === "added" ? first.newValue : first.oldValue;
          return (
            <Box key={productName} mb={4}>
              <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
                {productName} <StatusLabel type={first.change_type} />
              </Typography>
              <SectionReview
                data={data}
                fields={Object.entries(PRODUCT_LABELS).map(([key, label]) => ({
                  key,
                  label,
                }))}
                isAdded={first.change_type === "added"}
                isDeleted={first.change_type === "removed"}
              />
            </Box>
          );
        }

        return (
          <Box key={productName} mb={2}>
            <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
              {productName}
            </Typography>
            {items.map((item) => {
              if (skipChange(item.oldValue, item.newValue)) return null;
              const key = item.field.match(/\['([^']+)'\]$/)?.[1] ?? item.field;
              return (
                <ChangeItemDisplay
                  key={item.field}
                  item={{ ...item, displayLabel: PRODUCT_LABELS[key] ?? key }}
                />
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
};

export default ComplianceSummary;
