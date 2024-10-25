"use client";
import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import FormBase from "@bciers/components/form/FormBase";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { tasklistData } from "@reporting/src/app/components/facility/TaskListElements";
import {
  facilityEmissionSummaryUiSchema,
  facilityEmissionSummarySchema,
} from "@reporting/src/data/jsonSchema/facilityEmissionSummary";
import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";
// import { useRouter } from "next/navigation";

interface Props {
  versionId: number;
  facilityId: UUID;
}

const getsummaryData = async (versionId: number, facilityId: UUID) => {
  return actionHandler(
    `reporting/report-version/${versionId}/facility-report/${facilityId}/emission-summary`,
    "GET",
    `reporting/report-version/${versionId}/facility-report/${facilityId}/emission-summary`,
  );
};

const FacilityReview: React.FC<Props> = ({ versionId, facilityId }) => {
  // const router = useRouter();
  const [summaryData, setSummaryData] = useState({} as any);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedSummaryData = await getsummaryData(versionId, facilityId);
      setSummaryData(fetchedSummaryData);
    };

    fetchData();
  }, [versionId, facilityId]);

  const formData = {
    attributableForReporting: 0,
    attributableForReportingThreshold: 0,
    reportingOnlyEmission: 0,
    emissionCategories: {
      flaring: Number(summaryData.flaring),
      fugitive: Number(summaryData.fugitive),
      industrialProcess: Number(summaryData.industrial_process),
      onSiteTransportation: Number(summaryData.onsite),
      stationaryCombustion: Number(summaryData.stationary),
      ventingUseful: Number(summaryData.venting_useful),
      ventingNonUseful: Number(summaryData.venting_non_useful),
      waste: Number(summaryData.waste),
      wastewater: Number(summaryData.wastewater),
    },
    fuelExcluded: {
      woodyBiomass: Number(summaryData.woody_biomass),
      excludedBiomass: Number(summaryData.excluded_biomass),
      excludedNonBiomass: Number(summaryData.excluded_non_biomass),
    },
    otherExcluded: {
      lfoExcluded: Number(summaryData.lfo_excluded),
      fogExcluded: 0, // To be handled once we implement a way to capture FOG emissions
    },
  };

  const customStepNames = [
    "Operation Information",
    "Facilities Information",
    "Compliance Summary",
    "Sign-off & Submit",
  ];

  return (
    <Box sx={{ p: 3 }}>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader stepIndex={1} steps={customStepNames} />
      </div>
      <div className="w-full flex">
        <ReportingTaskList elements={tasklistData} />
        <div className="w-full md:max-w-[60%]">
          <FormBase
            schema={facilityEmissionSummarySchema}
            uiSchema={facilityEmissionSummaryUiSchema}
            formData={formData}
          >
            <div className="flex justify-end gap-3">
              <Button
                variant="contained"
                type="submit"
                onClick={() => console.log("continue")}
              >
                Continue
              </Button>
            </div>
          </FormBase>
        </div>
      </div>
    </Box>
  );
};

export default FacilityReview;
