import React from "react";
import { Box } from "@mui/material";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";
import { SectionReview } from "../finalReview/templates/SectionReview";
import ActivityView from "../finalReview/templates/ActivityView";
import { FieldDisplay } from "../finalReview/templates/FieldDisplay";
import { EmissionAllocationView } from "../finalReview/templates/EmissionAllocationView";
import {
  emissionsSummaryFields,
  productionDataFields,
} from "../finalReview/finalReviewFields";

// Field labels for non-attributable emissions
const fieldLabels: Record<string, string> = {
  activity: "Activity Name",
  source_type: "Source Type",
  emission_category: "Emission Category",
  gas_type: "Gas Type",
};

const fieldOrder = ["activity", "source_type", "emission_category", "gas_type"];

interface FacilityReportSectionProps {
  facilityName?: string;
  facilityData: any;
  isAdded?: boolean;
  isRemoved?: boolean;
  showReportingOnlyConditions?: boolean;
  expandable?: boolean; // <-- add optional prop
}

interface NonAttributableEmissionRecord {
  activity: string;
  source_type: string;
  emission_category: string;
  gas_type: string;
  change_type?: "added" | "removed" | "modified";
  old_value?: any;
  [key: string]: any;
}

export const FacilityReportSection: React.FC<FacilityReportSectionProps> = ({
  facilityName,
  facilityData,
  isAdded = false,
  isRemoved = false,
  showReportingOnlyConditions = true,
  expandable,
}) => {
  // Process non-attributable emissions to include change type
  const processedEmissions = React.useMemo(() => {
    const emissions: NonAttributableEmissionRecord[] = [];
    if (facilityData.reportnonattributableemissions_records) {
      facilityData.reportnonattributableemissions_records.forEach(
        (record: any) => {
          emissions.push({
            ...record,
            change_type:
              record.change_type ||
              (isAdded ? "added" : isRemoved ? "removed" : undefined),
          });
        },
      );
    }

    return emissions;
  }, [facilityData.reportnonattributableemissions_records, isAdded, isRemoved]);

  return (
    <Box>
      <SectionReview
        title={`Report Information - ${
          facilityData.facility_name || facilityName
        }`}
        data={{}}
        fields={[]}
        {...(expandable === false ? {} : { expandable: true })}
        isAdded={isAdded}
        isDeleted={isRemoved}
      >
        {/* Activities */}
        <ActivityView
          activity_data={facilityData.activity_data || []}
          isDeleted={isRemoved}
        />

        {/* Non-Attributable Emissions */}
        <SectionReview
          title="Non-Attributable Emissions"
          data={{}}
          fields={[]}
          isDeleted={isRemoved}
        >
          <FieldDisplay
            label="Did your non-attributable emissions exceed 100 tCO2e?"
            value={processedEmissions.length > 0}
            isDeleted={isRemoved}
          />
          {processedEmissions.length > 0 && (
            <Box>
              {processedEmissions.map((record, i) => (
                <div key={i} className="mb-4">
                  {record.change_type && (
                    <Box mb={1}>
                      <StatusLabel
                        type={
                          record.change_type === "removed"
                            ? "deleted"
                            : record.change_type
                        }
                      />
                    </Box>
                  )}
                  {fieldOrder.map((key) => (
                    <FieldDisplay
                      key={key}
                      label={fieldLabels[key]}
                      value={record[key]}
                      isDeleted={record.change_type === "removed"}
                      isAdded={record.change_type === "added"}
                      oldValue={
                        record.change_type === "modified"
                          ? record.old_value?.[key]
                          : undefined
                      }
                    />
                  ))}
                  {i < processedEmissions.length - 1 && <hr className="my-4" />}
                </div>
              ))}
            </Box>
          )}
        </SectionReview>

        {/* Emissions Summary */}
        <SectionReview
          title="Emissions Summary (in tCO2e)"
          data={facilityData.emission_summary || {}}
          fields={emissionsSummaryFields}
          isDeleted={isRemoved}
        />

        {/* Production Data - conditionally shown */}
        {showReportingOnlyConditions &&
          facilityData.report_products &&
          Object.keys(facilityData.report_products).length > 0 && (
            <SectionReview
              title="Production Data"
              data={facilityData.report_products}
              fields={[]}
              isDeleted={isRemoved}
            >
              {Object.values(facilityData.report_products).map(
                (product: any, index: number) => (
                  <SectionReview
                    key={product.report_product_id || index}
                    data={product}
                    fields={productionDataFields(product)}
                    isDeleted={isRemoved}
                  />
                ),
              )}
            </SectionReview>
          )}

        {/* Allocation of Emissions - conditionally shown */}
        {showReportingOnlyConditions &&
          facilityData.report_emission_allocation &&
          Object.keys(facilityData.report_emission_allocation).length > 0 && (
            <EmissionAllocationView
              data={facilityData.report_emission_allocation}
              isDeleted={isRemoved}
            />
          )}
      </SectionReview>
    </Box>
  );
};

export default FacilityReportSection;
