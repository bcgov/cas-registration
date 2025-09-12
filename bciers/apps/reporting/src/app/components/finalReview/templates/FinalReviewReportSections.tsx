"use client";
import React, { useEffect } from "react";

import { FacilityReport, FacilityReportLFO, ReportData } from "../reportTypes";
import { OperationTypes } from "@bciers/utils/src/enums";
import {
  additionalDataFields,
  complianceSummaryFields,
  eioFields,
  operationEmissionSummaryFields,
  operationFields,
  personResponsibleFields,
  reportNewEntrantFields,
} from "@reporting/src/app/components/finalReview/finalReviewFields";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";
import { FacilityReportSection } from "@reporting/src/app/components/shared/FacilityReportSection";
import FinalReviewFacilityGrid from "@reporting/src/app/components/finalReview/FinalReviewFacilityGrid";
import { SectionReview } from "@reporting/src/app/components/finalReview/templates/SectionReview";

interface Props {
  data: ReportData | null;
  version_id: any;
}

export const FinalReviewReportSections: React.FC<Props> = ({
  version_id,
  data,
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
  const {
    operation_type: operationType,
    registration_purpose: registrationPurpose,
  } = data.report_operation;
  // Helper functions to determine flow type
  const isEIO = operationType === OperationTypes.EIO;
  const isLFO = operationType === OperationTypes.LFO;
  const isSFO = operationType === OperationTypes.SFO;
  const isNewEntrant =
    registrationPurpose === RegistrationPurposes.NEW_ENTRANT_OPERATION;
  const isReportingOnly =
    registrationPurpose === RegistrationPurposes.REPORTING_OPERATION;

  const isSFOReportingOnly = isSFO && isReportingOnly;

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
            rowCount={facilityReportsLFO.length}
            version_id={version_id}
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
                showReportingOnlyConditions={!isReportingOnly}
              />
            ),
          )}
      </>
    );
  };

  if (!data) return null;

  return (
    <>
      {data.is_supplementary_report && (
        <SectionReview
          title="Reason for Change"
          data={data}
          fields={[
            {
              label: "Reason for submitting supplementary report",
              key: "reason_for_change",
            },
          ]}
        />
      )}

      {/* Review Operation Information - ALL FLOWS */}
      <SectionReview
        title="Review Operation Information"
        data={data.report_operation}
        fields={operationFields(isEIO)}
      />

      {/* Person Responsible for Submitting Report - ALL FLOWS */}
      <SectionReview
        title="Person Responsible for Submitting Report"
        data={data.report_person_responsible}
        fields={personResponsibleFields}
      />

      {/* EIO Flow - only show Electricity Import Data */}
      {isEIO && data.report_electricity_import_data && (
        <SectionReview
          title="Electricity Import Data"
          data={data.report_electricity_import_data[0]}
          fields={eioFields}
        />
      )}

      {/* Non-EIO Flows - show facility report information */}
      {!isEIO && data.facility_reports && renderFacilityReportInformation()}

      {/* Additional Reporting Data - ALL NON-EIO FLOWS */}
      {!isEIO && data.report_additional_data && (
        <SectionReview
          title="Additional Reporting Data"
          data={data.report_additional_data}
          fields={additionalDataFields}
        />
      )}

      {/* New Entrant Information - only for New Entrant flows */}
      {isNewEntrant && data.report_new_entrant.length > 0 && (
        <SectionReview
          title="Report New Entrant Information"
          data={data.report_new_entrant[0]}
          fields={reportNewEntrantFields(
            data.report_new_entrant[0].productions,
            data.report_new_entrant[0].report_new_entrant_emission,
          )}
        />
      )}

      {/* Operation Emission Summary - LFO flows only */}
      {isLFO && data.operation_emission_summary && (
        <SectionReview
          title="Operation Emission Summary"
          data={data.operation_emission_summary}
          fields={operationEmissionSummaryFields}
        />
      )}

      {/* Compliance Summary - ALL NON-EIO FLOWS */}
      {!isEIO && !isSFOReportingOnly && data.report_compliance_summary && (
        <SectionReview
          title="Compliance Summary"
          data={data.report_compliance_summary}
          fields={complianceSummaryFields(
            data.report_compliance_summary.products,
          )}
        />
      )}
    </>
  );
};
