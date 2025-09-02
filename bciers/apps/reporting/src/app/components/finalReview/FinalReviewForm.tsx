"use client";
import React, { useEffect, useState } from "react";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { SectionReview } from "./templates/SectionReview";
import { FacilityReport, ReportData } from "./reportTypes";
import type { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import Loading from "@bciers/components/loading/SkeletonForm";
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

interface Props {
  version_id: any;
  navigationInformation: NavigationInformation;
}

export const FinalReviewForm: React.FC<Props> = ({
  version_id,
  navigationInformation,
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
              {/* Reason for Edits - for supplementary reports */}
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
              {!isEIO() && renderFacilityReportInformation()}

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
              {!isEIO() &&
                !isSFOReportingOnly() &&
                data.report_compliance_summary && (
                  <SectionReview
                    title="Compliance Summary"
                    data={data.report_compliance_summary}
                    fields={complianceSummaryFields(
                      data.report_compliance_summary?.products,
                    )}
                  />
                )}

              <ReportingStepButtons
                backUrl={navigationInformation.backUrl}
                continueUrl={navigationInformation.continueUrl}
                buttonText={"Continue"}
                noSaveButton={true}
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
