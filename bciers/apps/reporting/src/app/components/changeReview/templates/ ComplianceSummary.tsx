import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";

const complianceSummaryLabels: Record<string, string> = {
  excess_emissions: "Excess Emissions",
  reporting_only_emissions: "Reporting Only Emissions",
  emissions_limit: "Emissions Limit",
  emissions_attributable_for_reporting: "Emissions Attributable for Reporting",
  emissions_attributable_for_compliance:
    "Emissions attributable for compliance",
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

interface ComplianceSummaryProps {
  changes: any[];
}

const ComplianceSummary: React.FC<ComplianceSummaryProps> = ({ changes }) => {
  if (changes.length === 0) return null;

  const isRecord = (value: any): value is Record<string, any> => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  };

  const getComplianceFieldDetails = (field: string) => {
    const productMatch = field.match(/\['products']\[(\d+)]/);
    if (productMatch) {
      return {
        isProduct: true,
        index: parseInt(productMatch[1], 10),
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

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue">
        Compliance Summary
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {changes.map((item, idx) => {
        const fieldInfo = getComplianceFieldDetails(item.field);

        if (fieldInfo?.isProduct) {
          const newValueRecord = isRecord(item.new_value) ? item.new_value : {};
          const oldValueRecord = isRecord(item.old_value) ? item.old_value : {};
          const productName =
            newValueRecord.name ||
            oldValueRecord.name ||
            `#${(fieldInfo.index || 0) + 1}`;

          return (
            <Box key={item.field + idx} mb={2}>
              <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-4">
                Product {productName}
                {item.change_type === "added" && <StatusLabel type="added" />}
                {item.change_type === "removed" && (
                  <StatusLabel type="deleted" />
                )}
              </Typography>
              {Object.entries(newValueRecord || oldValueRecord || {}).map(
                ([key]) => {
                  if (key === "name") return null;

                  const oldVal = isRecord(item.old_value)
                    ? item.old_value[key]?.toString()
                    : undefined;
                  const newVal = isRecord(item.new_value)
                    ? item.new_value[key]?.toString()
                    : undefined;
                  if (oldVal && newVal) {
                    const normalizedOld = parseFloat(oldVal).toFixed(4);
                    const normalizedNew = parseFloat(newVal).toFixed(4);
                    if (normalizedOld === normalizedNew) return null;
                  }

                  return (
                    <ChangeItemDisplay
                      key={key}
                      item={{
                        field: key,
                        new_value: isRecord(item.new_value)
                          ? item.new_value[key]
                          : undefined,
                        old_value: isRecord(item.old_value)
                          ? item.old_value[key]
                          : undefined,
                        change_type: item.change_type,
                        displayLabel: productFieldLabels[key] || key,
                      }}
                    />
                  );
                },
              )}
            </Box>
          );
        }

        return (
          <ChangeItemDisplay
            key={item.field + idx}
            item={{
              ...item,
              displayLabel: fieldInfo?.label || item.field,
            }}
          />
        );
      })}
    </Box>
  );
};

export default ComplianceSummary;
