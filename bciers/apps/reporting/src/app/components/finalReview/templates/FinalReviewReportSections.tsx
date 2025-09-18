"use client";
import React, { useEffect } from "react";

import { FacilityReport, FacilityReportLFO, ReportData } from "../reportTypes";
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
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";
import { flowHelpers } from "@reporting/src/app/components/taskList/flowHelpers";

interface Props {
  data: ReportData | null;
  version_id: any;
  origin?: "final-review" | "submitted";
  flow: ReportingFlow;
}

export const FinalReviewReportSections: React.FC<Props> = ({
  version_id,
  data,
  origin,
  flow,
}) => {
  useEffect(() => {
    if (data) {
      const hash = window.location.hash;
      if (hash) {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }, [data]);

  if (!data) return null;

  const { isEIO, isLFO, isReportingOnly, isNewEntrant, isSFOReportingOnly } =
    flowHelpers(flow);

  const facilityReportsLFO: FacilityReportLFO[] = isLFO
    ? (data.facility_reports as FacilityReportLFO[])
    : [];

  const facilityReports: FacilityReport[] = !isLFO
    ? (data.facility_reports as FacilityReport[])
    : [];

  const renderFacilityReportInformation = () => {
    if (!data?.facility_reports) return null;
    if (isLFO) {
      // For LFO, render the grid
      return (
        <div id="facility-grid">
          <FinalReviewFacilityGrid
            data={facilityReportsLFO.map(
              (facilityReport: FacilityReportLFO) => ({
                facility: facilityReport.facility,
                facility_name: facilityReport.facility_name,
              }),
            )}
            version_id={version_id}
            origin={origin}
          />
        </div>
      );
    }

    // For other flows, render individual FacilityReportSection
    return (
      <>
        {facilityReports &&
          Object.entries(facilityReports).map(
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
  };

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
      render: renderFacilityReportInformation,
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
    </>
  );
};
