import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";

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
  if (!changes || changes.length === 0) return null;

  const isRecord = (value: any): value is Record<string, any> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

  const getProductName = (item: any) => {
    if (item.newValue?.name) return item.newValue.name;
    if (item.oldValue?.name) return item.oldValue.name;
    const match = item.field.match(/\['products']\['([^']+)']/);
    return match ? match[1] : "Unknown Product";
  };

  const getComplianceFieldDetails = (field: string) => {
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

  const isFullProductChange = (item: any) =>
    (item.change_type === "added" &&
      item.oldValue == null &&
      item.newValue != null) ||
    (item.change_type === "removed" &&
      item.oldValue != null &&
      item.newValue == null);

  let regulatoryHeadingRendered = false;

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Compliance Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* Render non-product fields */}
      {nonProductChanges.map((item, idx) => {
        const fieldInfo = getComplianceFieldDetails(item.field);
        const fieldKey = fieldInfo?.label || item.field;

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
                  item={{ ...item, displayLabel: regulatoryField.label }}
                />
              </Box>
            );
          }
          return (
            <ChangeItemDisplay
              key={item.field + idx}
              item={{ ...item, displayLabel: regulatoryField.label }}
            />
          );
        }

        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{ ...item, displayLabel: fieldKey }}
          />
        );
      })}

      {/* Render product changes */}
      {Object.entries(productChangesMap).map(([productName, items], idx) => {
        const firstItem = items[0];

        if (isFullProductChange(firstItem)) {
          const statusType =
            firstItem.change_type === "removed" ? "deleted" : "added";
          const productData =
            statusType === "added" ? firstItem.newValue : firstItem.oldValue;

          return (
            <Box key={productName + idx} mb={4}>
              <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
                {productName} <StatusLabel type={statusType} />
              </Typography>
              <SectionReview
                data={productData}
                fields={Object.entries(productFieldLabels).map(
                  ([key, label]) => ({ key, label }),
                )}
                isAdded={statusType === "added"}
                isDeleted={statusType === "deleted"}
              />
            </Box>
          );
        }

        // Modified product → display only changed fields
        return (
          <Box key={productName + idx} mb={2}>
            <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
              {productName}
            </Typography>
            {items.map((item) => {
              // If it's an object, render per field
              if (isRecord(item.newValue) || isRecord(item.oldValue)) {
                const newValObj = isRecord(item.newValue) ? item.newValue : {};
                const oldValObj = isRecord(item.oldValue) ? item.oldValue : {};

                return Object.entries({ ...newValObj, ...oldValObj })
                  .filter(([key]) => key !== "name")
                  .map(([key]) => {
                    const oldVal = oldValObj[key]?.toString();
                    const newVal = newValObj[key]?.toString();

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
                          oldValue: oldVal,
                          newValue: newVal,
                          change_type: item.change_type,
                          displayLabel: productFieldLabels[key] || key,
                        }}
                      />
                    );
                  });
              } else {
                const fieldKey =
                  getComplianceFieldDetails(item.field)?.fieldKey || item.field;
                const oldVal = item.oldValue?.toString();
                const newVal = item.newValue?.toString();

                if (
                  oldVal &&
                  newVal &&
                  parseFloat(oldVal).toFixed(4) ===
                    parseFloat(newVal).toFixed(4)
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
        );
      })}
    </Box>
  );
};

export default ComplianceSummary;
