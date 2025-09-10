"use client";
import React, { useEffect } from "react";

import { FacilityReport, ReportData } from "../reportTypes";
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

  console.log("FinalReviewReportSections data:", data);

  // Helper functions to determine flow type
  const isEIO = () =>
    data?.report_operation.operation_type === OperationTypes.EIO;
  const isLFO = () =>
    data?.report_operation.operation_type === OperationTypes.LFO;
  const isSFO = () =>
    data?.report_operation.operation_type === OperationTypes.SFO;
  const isNewEntrant = () =>
    data?.report_operation.registration_purpose ===
    RegistrationPurposes.NEW_ENTRANT_OPERATION;
  const isReportingOnly = () =>
    data?.report_operation.registration_purpose ===
    RegistrationPurposes.REPORTING_OPERATION;

  const isSFOReportingOnly = () => isSFO() && isReportingOnly();

  const renderFacilityReportInformation = () => (
    <>
      {data?.facility_reports &&
        Object.entries(data.facility_reports).map(
          ([facilityKey, facilityReport]: [string, FacilityReport]) => (
            <FacilityReportSection
              key={facilityKey}
              facilityName={facilityReport.facility_name}
              facilityData={facilityReport}
              showReportingOnlyConditions={!isReportingOnly()}
            />
          ),
        )}
    </>
  );

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
        fields={operationFields(isEIO())}
      />

      {/* Person Responsible for Submitting Report - ALL FLOWS */}
      <SectionReview
        title="Person Responsible for Submitting Report"
        data={data.report_person_responsible}
        fields={personResponsibleFields}
      />

      {/* EIO Flow - only show Electricity Import Data */}
      {isEIO() && data.report_electricity_import_data && (
        <SectionReview
          title="Electricity Import Data"
          data={data.report_electricity_import_data[0]}
          fields={eioFields}
        />
      )}

      {/* Non-EIO Flows - show facility report information */}
      {!isEIO() &&
        (isLFO() && data.facility_reports ? (
          <div id="facility-grid">
            <FinalReviewFacilityGrid
              data={Object.values(data.facility_reports).map(
                (facilityReport: FacilityReport) => ({
                  facility: facilityReport.facility,
                  facility_name: facilityReport.facility_name,
                }),
              )}
              rowCount={Object.keys(data.facility_reports).length}
              version_id={version_id}
            />
          </div>
        ) : (
          renderFacilityReportInformation()
        ))}

      {/* Additional Reporting Data - ALL NON-EIO FLOWS */}
      {!isEIO() && data.report_additional_data && (
        <SectionReview
          title="Additional Reporting Data"
          data={data.report_additional_data}
          fields={additionalDataFields}
        />
      )}

      {/* New Entrant Information - only for New Entrant flows */}
      {isNewEntrant() && data.report_new_entrant.length > 0 && (
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
      {isLFO() && data.operation_emission_summary && (
        <SectionReview
          title="Operation Emission Summary"
          data={data.operation_emission_summary}
          fields={operationEmissionSummaryFields}
        />
      )}

      {/* Compliance Summary - ALL NON-EIO FLOWS */}
      {!isEIO() && !isSFOReportingOnly() && data.report_compliance_summary && (
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
