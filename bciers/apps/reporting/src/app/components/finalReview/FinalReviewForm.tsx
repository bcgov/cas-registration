"use client";
import React, { useEffect, useState } from "react";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";

import { SectionReview } from "./templates/SectionReview";
import ActivitiesView from "@reporting/src/app/components/finalReview/templates/ActivityView";
import { FieldDisplay } from "@reporting/src/app/components/finalReview/templates/FieldDisplay";

import { FacilityReport, ReportData } from "./reportTypes";
import type { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { EmissionAllocationView } from "@reporting/src/app/components/finalReview/templates/EmissionAllocationView";
import { getFinalReviewData } from "@reporting/src/app/utils/getFinalReviewData";
import Loading from "@bciers/components/loading/SkeletonForm";
import { OperationTypes } from "@bciers/utils/src/enums";
import {
  additionalDataFields,
  complianceSummaryFields,
  eioFields,
  emissionsSummaryFields,
  operationEmissionSummaryFields,
  operationFields,
  personResponsibleFields,
  productionDataFields,
  reportNewEntrantFields,
} from "@reporting/src/app/components/finalReview/finalReviewFields";
import { RegistrationPurposes } from "@/registration/app/components/operations/registration/enums";

interface Props {
  version_id: any;
  navigationInformation: NavigationInformation;
}

const fieldOrder = ["activity", "source_type", "emission_category", "gas_type"];
const fieldLabels: Record<string, string> = {
  activity: "Activity Name",
  source_type: "Source Type",
  emission_category: "Emission Category",
  gas_type: "Gas Type",
};

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
    data?.report_operation.registration_purpose === OperationTypes.EIO;
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

  // Component for rendering facility report information
  const renderFacilityReportInformation = () => (
    <>
      {data?.facility_reports.map((facilityReport: FacilityReport, index) => (
        <SectionReview
          key={facilityReport.facility || index}
          title={`Report Information - ${facilityReport.facility_name}`}
          data={data.report_compliance_summary}
          fields={[]}
          expandable
        >
          <ActivitiesView activity_data={facilityReport.activity_data} />

          <SectionReview
            title="Non-Attributable Emissions"
            data={{}}
            fields={[]}
          >
            <FieldDisplay
              label="Did your non-attributable emissions exceed 100 tCO2e?"
              value={
                facilityReport.reportnonattributableemissions_records?.length >
                0
              }
            />
            {facilityReport.reportnonattributableemissions_records?.length >
              0 &&
              facilityReport.reportnonattributableemissions_records.map(
                (record, i) => (
                  <div key={i} className="mb-4">
                    {fieldOrder.map((key) => (
                      <FieldDisplay
                        key={key}
                        label={fieldLabels[key]}
                        value={record[key as keyof typeof record]}
                      />
                    ))}
                    {i <
                      facilityReport.reportnonattributableemissions_records
                        .length -
                        1 && <hr className="my-4" />}
                  </div>
                ),
              )}
          </SectionReview>

          <SectionReview
            title="Emissions Summary (in tCO2e)"
            data={facilityReport.emission_summary}
            fields={emissionsSummaryFields}
          />

          {/* Production Data - only for LFO and SFO non-reporting flows */}
          {!isReportingOnly() && facilityReport.report_products.length > 0 && (
            <SectionReview
              title="Production Data"
              data={facilityReport.report_products}
              fields={[]}
            >
              {facilityReport.report_products.map((product) => (
                <SectionReview
                  key={product.report_product_id}
                  data={product}
                  fields={productionDataFields(product)}
                />
              ))}
            </SectionReview>
          )}

          {/* Allocation of Emissions - only for LFO and SFO non-reporting flows */}
          {!isReportingOnly() && (
            <EmissionAllocationView
              data={facilityReport.report_emission_allocation}
            />
          )}
        </SectionReview>
      ))}
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
                  title="Reason for Edits"
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
