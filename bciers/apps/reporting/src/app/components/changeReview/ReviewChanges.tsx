// filepath: /Users/ayeshaayesha/Ayesha/cas-registration/bciers/apps/reporting/src/app/components/reviewChanges/index.tsx
import React from "react";
import { Box, Typography, Paper, Divider, Grid } from "@mui/material";
import {
  ReportOperation,
  ReportPersonResponsible,
  ReportAdditionalData,
  ReportComplianceSummary,
} from "../finalReview/reportTypes";

interface ChangeItem {
  field: string;
  old_value: any;
  new_value: any;
}

interface ReviewChangesProps {
  changes: ChangeItem[];
}

// Helper to get a user-friendly label from a field path
const fieldLabelMap: Record<string, string> = {
  // Add more mappings as needed
  "root['report_operation']['regulated_products']": "Regulated Products",
  "root['report_person_responsible']['street_address']": "Street Address",
  "root['report_person_responsible']['municipality']": "Municipality",
  "root['report_person_responsible']['province']": "Province",
  "root['report_person_responsible']['postal_code']": "Postal Code",
  "root['report_person_responsible']['first_name']": "First Name",
  "root['report_person_responsible']['phone_number']": "Phone Number",
  "root['report_person_responsible']['last_name']": "Last Name",
  "root['report_person_responsible']['email']": "Email",
  // ...add more as needed
};

function getSection(field: string): string {
  if (field.includes("['report_operation']")) return "Report Operation";
  if (field.includes("['report_person_responsible']"))
    return "Person Responsible";
  if (field.includes("['report_additional_data']")) return "Additional Data";
  if (field.includes("['report_compliance_summary']"))
    return "Compliance Summary";
  if (field.includes("['facility_reports']")) return "Facility Reports";
  return "Other";
}

function getLabel(field: string): string {
  return (
    fieldLabelMap[field] ||
    field
      .split("['")
      .pop()
      ?.replace("']", "")
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()) ||
    field
  );
}

const ValueBox = ({ value }: { value: any }) => (
  <Paper
    variant="outlined"
    sx={{ p: 1, bgcolor: "#f9f9f9", fontSize: 14, wordBreak: "break-all" }}
  >
    {typeof value === "object" ? (
      <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
    ) : (
      String(value)
    )}
  </Paper>
);

const ReviewChanges: React.FC<ReviewChangesProps> = ({ changes }) => {
  console.log("ReviewChanges changes:", changes);
  // Group changes by section
  const sectioned: Record<string, ChangeItem[]> = {};
  changes.forEach((change) => {
    const section = getSection(change.field);
    if (!sectioned[section]) sectioned[section] = [];
    sectioned[section].push(change);
  });

  return (
    <Box>
      {Object.entries(sectioned).map(([section, items]) => (
        <Box key={section} mb={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {section}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {items.map((item, idx) => (
            <Box key={item.field + idx} mb={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <Typography fontWeight={500}>
                    {getLabel(item.field)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography color="text.secondary" variant="body2">
                    Old Value
                  </Typography>
                  <ValueBox value={item.old_value} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography color="text.secondary" variant="body2">
                    New Value
                  </Typography>
                  <ValueBox value={item.new_value} />
                </Grid>
              </Grid>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Box>
      ))}
      {changes.length === 0 && (
        <Typography color="text.secondary">
          No changes detected between the selected report versions.
        </Typography>
      )}
    </Box>
  );
};

export default ReviewChanges;
