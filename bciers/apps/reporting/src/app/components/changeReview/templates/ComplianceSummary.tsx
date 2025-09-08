import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";

const complianceSummaryLabels: Record<string, string> = {
  emissions_attributable_for_reporting: "Emissions Attributable for Reporting",
  reporting_only_emissions: "Reporting Only Emissions",
  emissions_attributable_for_compliance:
    "Emissions Attributable for Compliance",
  emissions_limit: "Emissions Limit",
  excess_emissions: "Excess Emissions",
  credited_emissions: "Credited Emissions",
};

const productFieldLabels: Record<string, string> = {
  name: "Product Name",
  annual_production: "Annual Production",
  apr_dec_production: "Apr-Dec Production",
  emission_intensity: "Emission Intensity",
  allocated_industrial_process_emissions:
    "Allocated Industrial Process Emissions",
  allocated_compliance_emissions: "Allocated Compliance Emissions",
};

const regulatoryFields = [
  { label: "Reduction factor", key: "regulatory_values.reduction_factor" },
  { label: "Tightening rate", key: "regulatory_values.tightening_rate" },
  {
    label: "Initial compliance period",
    key: "regulatory_values.initial_compliance_period",
  },
  { label: "Compliance period", key: "regulatory_values.compliance_period" },
];

interface ComplianceSummaryProps {
  changes: any[];
}

const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({ changes }) => {
  if (changes.length === 0) return null;

  const isRecord = (value: any): value is Record<string, any> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  // Extract product info from path or values
  const getProductName = (item: any) => {
    if (item.newValue?.name) return item.newValue.name;
    if (item.oldValue?.name) return item.oldValue.name;

    const match = item.field.match(/\['products']\['([^']+)']/);
    if (match) return match[1];

    return "Unknown Product";
  };

  const getComplianceFieldDetails = (field: string) => {
    // Match product fields: ['products'][Product Name]['fieldName']
    const productFieldMatch = field.match(
      /\['products']\[(?:'([^']+)'|(\d+))\](?:\['([^']+)'])?/,
    );
    if (productFieldMatch) {
      return {
        isProduct: true,
        productName: productFieldMatch[1] || productFieldMatch[2],
        fieldKey: productFieldMatch[3] || null,
      };
    }

    // Match compliance summary fields: ['fieldName']
    const fieldMatch = field.match(/\['([^']+)']$/);
    if (fieldMatch) {
      const fieldName = fieldMatch[1];
      return {
        isProduct: false,
        label: complianceSummaryLabels[fieldName] || fieldName,
      };
    }

    return null;
  };

  const productChangesMap: Record<string, any[]> = {};
  const nonProductChanges: any[] = [];

  changes.forEach((item) => {
    const fieldInfo = getComplianceFieldDetails(item.field);
    if (fieldInfo?.isProduct) {
      const productName = getProductName(item);
      if (!productChangesMap[productName]) productChangesMap[productName] = [];
      productChangesMap[productName].push(item);
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

      {/* Render non-product fields first */}
      {nonProductChanges.map((item, idx) => {
        const fieldInfo = getComplianceFieldDetails(item.field);
        const fieldKey = fieldInfo?.label || item.field;

        // Check for regulatory fields
        const regulatoryField = regulatoryFields.find(
          (f) => f.key === item.field,
        );
        if (regulatoryField) {
          if (!regulatoryHeadingRendered) {
            regulatoryHeadingRendered = true;
            return (
              <Box key={"regulatory-heading-" + idx} mb={2}>
                <Typography className="font-bold text-bc-bg-blue mt-4 mb-2">
                  Regulatory values
                </Typography>
                <ChangeItemDisplay
                  key={item.field + idx}
                  item={{
                    ...item,
                    displayLabel: regulatoryField.label,
                  }}
                />
              </Box>
            );
          }
          return (
            <ChangeItemDisplay
              key={item.field + idx}
              item={{
                ...item,
                displayLabel: regulatoryField.label,
              }}
            />
          );
        }

        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{
              ...item,
              displayLabel: fieldKey,
            }}
          />
        );
      })}

      {/* Render product changes grouped by productName */}
      {Object.entries(productChangesMap).map(([productName, items], idx) => (
        <Box key={productName + idx} mb={2}>
          <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
            Product {productName}
            {items[0].change_type === "added" && <StatusLabel type="added" />}
            {items[0].change_type === "removed" && (
              <StatusLabel type="deleted" />
            )}
          </Typography>

          {items.map((item) => {
            if (isRecord(item.newValue) || isRecord(item.oldValue)) {
              const newValueRecord = isRecord(item.newValue)
                ? item.newValue
                : {};
              const oldValueRecord = isRecord(item.oldValue)
                ? item.oldValue
                : {};

              return Object.entries(newValueRecord || oldValueRecord).map(
                ([key]) => {
                  if (key === "name") return null;

                  const oldVal = oldValueRecord[key]?.toString();
                  const newVal = newValueRecord[key]?.toString();
                  if (
                    oldVal &&
                    newVal &&
                    parseFloat(oldVal).toFixed(4) ===
                      parseFloat(newVal).toFixed(4)
                  )
                    return null;

                  return (
                    <ChangeItemDisplay
                      key={item.field + key}
                      item={{
                        field: key,
                        oldValue: oldValueRecord[key],
                        newValue: newValueRecord[key],
                        change_type: item.change_type,
                        displayLabel: productFieldLabels[key] || key,
                      }}
                    />
                  );
                },
              );
            } else {
              const fieldKey =
                getComplianceFieldDetails(item.field)?.fieldKey || item.field;
              const oldVal = item.oldValue?.toString();
              const newVal = item.newValue?.toString();
              if (
                oldVal &&
                newVal &&
                parseFloat(oldVal).toFixed(4) === parseFloat(newVal).toFixed(4)
              )
                return null;

              return (
                <ChangeItemDisplay
                  key={item.field}
                  item={{
                    field: fieldKey,
                    oldValue: item.oldValue,
                    newValue: item.newValue,
                    change_type: item.change_type,
                    displayLabel: productFieldLabels[fieldKey] || fieldKey,
                  }}
                />
              );
            }
          })}
        </Box>
      ))}
    </Box>
  );
};

export default ComplianceSummary;
