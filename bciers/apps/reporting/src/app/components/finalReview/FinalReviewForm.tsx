"use client";
import React, { useEffect, useState } from "react";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { SectionReview } from "./templates/SectionReview";
import { FacilityReport, ReportData } from "./reportTypes";
import {
  NavigationInformation,
  ReportingFlow,
} from "@reporting/src/app/components/taskList/types";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import Loading from "@bciers/components/loading/SkeletonForm";
import {
  additionalDataFields,
  complianceSummaryFields,
  eioFields,
  operationEmissionSummaryFields,
  operationFields,
  personResponsibleFields,
  reportNewEntrantFields,
} from "@reporting/src/app/components/finalReview/finalReviewFields";
import { FacilityReportSection } from "@reporting/src/app/components/shared/FacilityReportSection";
import FinalReviewFacilityGrid from "@reporting/src/app/components/finalReview/FinalReviewFacilityGrid";
import { Box } from "@mui/material";
import { flowHelpers } from "@reporting/src/app/components/taskList/flowHelpers";

interface Props {
  version_id: any;
  navigationInformation: NavigationInformation;
  flow: ReportingFlow;
}

export const FinalReviewForm: React.FC<Props> = ({
  version_id,
  navigationInformation,
  flow,
}) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const finalReviewData = await getFinalReviewData(version_id);
      setData(finalReviewData);
      setLoading(false);
    }
    fetchData();
  }, [version_id]);

  const { isEIO, isLFO, isReportingOnly, isNewEntrant, isSFOReportingOnly } =
    flowHelpers(flow);

  const renderFacilityReports = () => (
    <>
      {data?.facility_reports &&
        Object.entries(data.facility_reports).map(
          ([facilityKey, facilityReport]: [string, FacilityReport]) => (
            <FacilityReportSection
              key={facilityKey}
              facilityName={facilityReport.facility_name}
              facilityData={facilityReport}
              showWhenNotReportingOnly={!isReportingOnly}
            />
          ),
        )}
    </>
  );

  const sectionConfigs = [
    {
      title: "Reason for Change",
      condition: (reportData: ReportData) => reportData.is_supplementary_report,
      getData: (reportData: ReportData) => reportData,
      fields: [
        {
          label: "Reason for submitting supplementary report",
          key: "reason_for_change",
        },
      ],
    },
    {
      title: "Review Operation Information",
      condition: () => true,
      getData: (reportData: ReportData) => reportData.report_operation,
      fields: () => operationFields(isEIO),
    },
    {
      title: "Person Responsible for Submitting Report",
      condition: () => true,
      getData: (reportData: ReportData) => reportData.report_person_responsible,
      fields: () => personResponsibleFields,
    },
    {
      title: "Electricity Import Data",
      condition: (reportData: ReportData) =>
        isEIO && !!reportData.report_electricity_import_data,
      getData: (reportData: ReportData) =>
        reportData.report_electricity_import_data[0],
      fields: () => eioFields,
    },
    {
      title: "Facility Reports",
      condition: (reportData: ReportData) =>
        !isEIO && !!reportData.facility_reports,
      render: renderFacilityReports,
    },
    {
      title: "Additional Reporting Data",
      condition: (reportData: ReportData) =>
        !isEIO && !!reportData.report_additional_data,
      getData: (reportData: ReportData) => reportData.report_additional_data,
      fields: () => additionalDataFields,
    },
    {
      title: "Report New Entrant Information",
      condition: (reportData: ReportData) =>
        isNewEntrant && reportData.report_new_entrant.length > 0,
      getData: (reportData: ReportData) => reportData.report_new_entrant[0],
      fields: (reportData: ReportData) =>
        reportNewEntrantFields(
          reportData.report_new_entrant[0].productions,
          reportData.report_new_entrant[0].report_new_entrant_emission,
        ),
    },
    {
      title: "Operation Emission Summary",
      condition: (reportData: ReportData) =>
        isLFO && !!reportData.operation_emission_summary,
      getData: (reportData: ReportData) =>
        reportData.operation_emission_summary,
      fields: () => operationEmissionSummaryFields,
    },
    {
      title: "Compliance Summary",
      condition: (reportData: ReportData) =>
        !isEIO && !isSFOReportingOnly && !!reportData.report_compliance_summary,
      getData: (reportData: ReportData) => reportData.report_compliance_summary,
      fields: (reportData: ReportData) =>
        complianceSummaryFields(reportData.report_compliance_summary?.products),
    },
  ];

  return (
    <>
      <div className="container mx-auto p-4" data-testid="facility-review">
        <MultiStepHeader
          stepIndex={navigationInformation.headerStepIndex}
          steps={navigationInformation.headerSteps}
        />
      </div>

      <div className="w-full flex">
        <div className="hidden md:block">
          <ReportingTaskList elements={navigationInformation.taskList} />
        </div>

        <div>
          {!loading && data ? (
            <>
              {sectionConfigs.map((section) => {
                if (!section.condition(data)) return null;
                if (section.render)
                  return (
                    <React.Fragment key={section.title}>
                      {section.render()}
                    </React.Fragment>
                  );

                const sectionData = section.getData!(data);
                const sectionFields =
                  typeof section.fields === "function"
                    ? section.fields(data)
                    : section.fields;

                return (
                  <SectionReview
                    key={section.title}
                    title={section.title}
                    data={sectionData}
                    fields={sectionFields}
                  />
                );
              })}

              <ReportingStepButtons
                backUrl={navigationInformation.backUrl}
                continueUrl={navigationInformation.continueUrl}
                buttonText="Continue"
                noSaveButton
              />
            </>
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </>
  );
};
