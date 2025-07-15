import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { ChangeItemDisplay } from "./ChangeItemDisplay";
import { ChangeItem } from "../constants/types";

interface DisplayChangeItem extends ChangeItem {
  displayLabel: string;
  isNewAddition?: boolean;
}

interface EmissionSummaryChangeViewProps {
  data: ChangeItem[];
}

interface ProcessedSection {
  heading?: string;
  changes: DisplayChangeItem[];
}

export const EmissionSummaryChangeView: React.FC<
  EmissionSummaryChangeViewProps
> = ({ data }) => {
  // Define the proper field structure matching final review schema
  const fieldStructure = [
    {
      section: "main",
      fields: [
        "attributable_for_reporting",
        "attributable_for_reporting_threshold",
      ],
    },
    {
      section: "Emission Categories",
      fields: [
        "emission_categories.flaring",
        "emission_categories.fugitive",
        "emission_categories.industrial_process",
        "emission_categories.onsite_transportation",
        "emission_categories.stationary_combustion",
        "emission_categories.venting_useful",
        "emission_categories.venting_non_useful",
        "emission_categories.waste",
        "emission_categories.wastewater",
      ],
    },
    {
      section: "Emissions excluded by fuel type",
      fields: [
        "fuel_excluded.woody_biomass",
        "fuel_excluded.excluded_biomass",
        "fuel_excluded.excluded_non_biomass",
      ],
    },
    {
      section: "Other excluded emissions",
      fields: ["other_excluded.lfo_excluded"],
    },
  ];

  // Field labels mapping - matching exact titles from final review schema
  const fieldLabels: Record<string, string> = {
    attributable_for_reporting: "Emissions attributable for reporting",
    attributable_for_reporting_threshold:
      "Emissions attributable for reporting threshold",
    "emission_categories.flaring": "Flaring emissions",
    "emission_categories.fugitive": "Fugitive emissions",
    "emission_categories.industrial_process": "Industrial process emissions",
    "emission_categories.onsite_transportation":
      "On-site transportation emissions",
    "emission_categories.stationary_combustion":
      "Stationary fuel combustion emissions",
    "emission_categories.venting_useful": "Venting emissions - useful",
    "emission_categories.venting_non_useful": "Venting emissions - non-useful",
    "emission_categories.waste": "Emissions from waste",
    "emission_categories.wastewater": "Emissions from wastewater",
    "fuel_excluded.woody_biomass": "CO2 emissions from excluded woody biomass",
    "fuel_excluded.excluded_biomass": "Other emissions from excluded biomass",
    "fuel_excluded.excluded_non_biomass": "Emissions from excluded non-biomass",
    "other_excluded.lfo_excluded":
      "Emissions from line tracing and non-processing and non-compression activities",
  };

  // Process changes according to the field structure
  const processChanges = (): ProcessedSection[] => {
    const sections: ProcessedSection[] = [];

    fieldStructure.forEach((structureSection) => {
      const sectionChanges: DisplayChangeItem[] = [];

      data.forEach((change) => {
        // Extract the field key from the path - handle both formats
        let fieldKey = "";

        // Handle facility_reports format: root['facility_reports'][Facility Name]['emission_summary']['field']
        if (
          change.field.includes("facility_reports") &&
          change.field.includes("emission_summary")
        ) {
          // Skip if this is not actually an emission_summary field but allocation totals
          if (
            change.field.includes("Report Product Emission Allocation Totals")
          ) {
            return;
          }

          // Extract field after emission_summary using string splitting
          const parts = change.field.split("emission_summary']['");
          if (parts.length > 1) {
            fieldKey = parts[1].replace(/']\['/g, ".").replace(/']*$/g, "");
          }
        }
        // Handle direct emission_summary format: emission_summary']['field']
        else if (change.field.includes("emission_summary']['")) {
          // Skip if this is not actually an emission_summary field but allocation totals
          if (
            change.field.includes("Report Product Emission Allocation Totals")
          ) {
            return;
          }

          const directMatch = change.field.split("emission_summary']['")[1];
          if (directMatch) {
            fieldKey = directMatch.replace(/']\['/g, ".").replace(/']*$/g, "");
          }
        }

        if (fieldKey) {
          // Clean up the field key
          fieldKey = fieldKey.replace(/['\[\]]/g, "");

          // Only process fields that are actually defined in our emission summary structure
          if (structureSection.fields.includes(fieldKey)) {
            const displayLabel = fieldLabels[fieldKey] || fieldKey;

            // Determine change type and flags
            let changeType = change.change_type;
            let isNewAddition = false;

            if (change.old_value === null || change.old_value === undefined) {
              changeType = "added";
              isNewAddition = true;
            } else if (
              change.new_value === null ||
              change.new_value === undefined
            ) {
              changeType = "deleted";
            }

            sectionChanges.push({
              ...change,
              displayLabel,
              change_type: changeType,
              isNewAddition,
            } as DisplayChangeItem);
          }
        }
      });

      if (sectionChanges.length > 0) {
        sections.push({
          heading:
            structureSection.section === "main"
              ? undefined
              : structureSection.section,
          changes: sectionChanges,
        });
      }
    });

    return sections;
  };

  const processedSections = processChanges();

  if (processedSections.length === 0) {
    return null;
  }

  return (
    <Box mb={4}>
      <Typography className="form-heading text-xl font-bold flex items-center text-bc-bg-blue mb-4">
        Emissions Summary (in tCO2e)
      </Typography>

      {processedSections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {section.heading && (
            <Typography className="py-2 w-full font-bold text-bc-bg-blue mb-2">
              {section.heading}
            </Typography>
          )}

          {section.changes.map((change, changeIndex) => (
            <ChangeItemDisplay
              key={`${change.field}-${changeIndex}`}
              item={change}
            />
          ))}

          {/* Add separator between sections except for the last one */}
          {sectionIndex < processedSections.length - 1 && (
            <Divider sx={{ my: 3 }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};
