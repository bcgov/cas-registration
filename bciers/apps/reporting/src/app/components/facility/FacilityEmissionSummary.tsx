"use client";
import React from "react";
import { Box, Button } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { tasklistData } from "@reporting/src/app/components/facility/TaskListElements";
import {
  facilityEmissionSummaryUiSchema,
  facilityEmissionSummarySchema,
} from "@reporting/src/data/jsonSchema/facilityEmissionSummary";
import { UUID } from "crypto";
import Link from "next/link";

interface Props {
  versionId: number;
  facilityId: UUID;
  summaryFormData: {
    attributableForReporting: string;
    attributableForReportingThreshold: string;
    reportingOnlyEmission: string;
    emissionCategories: {
      flaring: string;
      fugitive: string;
      industrialProcess: string;
      onSiteTransportation: string;
      stationaryCombustion: string;
      ventingUseful: string;
      ventingNonUseful: string;
      waste: string;
      wastewater: string;
    };
    fuelExcluded: {
      woodyBiomass: string;
      excludedBiomass: string;
      excludedNonBiomass: string;
    };
    otherExcluded: {
      lfoExcluded: string;
      fogExcluded: string; // To be handled once we implement a way to capture FOG emissions
    };
  };
}

const FacilityEmissionSummary: React.FC<Props> = ({
  versionId,
  facilityId,
  summaryFormData,
}) => {
  console.log(summaryFormData);

  const customStepNames = [
    "Operation Information",
    "Report Information",
    "Additional Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  const backRef = `/reports/${versionId}/facilities/${facilityId}/non-attributable`;
  const continueRef = `/reports/${versionId}/facilities/${facilityId}/production`;

  return (
    <Box sx={{ p: 3 }}>
      <div
        className="container mx-auto p-4"
        data-testid="facility-emission-summary"
      >
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={tasklistData} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={facilityEmissionSummarySchema}
            uiSchema={facilityEmissionSummaryUiSchema}
            formData={summaryFormData}
          >
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Link href={backRef} passHref>
                <Button variant="outlined">Back</Button>
              </Link>
              <Link href={continueRef} passHref>
                <Button variant="contained" color="primary">
                  Continue
                </Button>
              </Link>
            </Box>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default FacilityEmissionSummary;
