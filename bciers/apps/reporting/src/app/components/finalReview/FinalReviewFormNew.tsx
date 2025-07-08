"use client";
import React from "react";
import MultiStepHeader from "@bciers/components/form/components/MultiStepHeader";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";

import { SectionReview } from "./templates/SectionReview";
import ActivitiesView from "@reporting/src/app/components/finalReview/templates/ActivityView";
import { FieldDisplay } from "@reporting/src/app/components/finalReview/templates/FieldDisplay";

import { FacilityReport, ReportData } from "./reportTypes";
import type { NavigationInformation } from "@reporting/src/app/components/taskList/types";
import { EmissionAllocationView } from "@reporting/src/app/components/finalReview/templates/EmissionAllocationView";

interface Props {
  data: ReportData;
  navigationInformation: NavigationInformation;
}

const fieldOrder = ["activity", "source_type", "emission_category", "gas_type"];
const fieldLabels: Record<string, string> = {
  activity: "Activity Name",
  source_type: "Source Type",
  emission_category: "Emission Category",
  gas_type: "Gas Type",
};

const operationFields = [
  { label: "Report Type", key: "report_type" },
  { label: "Operation Representatives", key: "representatives" },
  { label: "Operator Legal Name", key: "operator_legal_name" },
  { label: "Operator Trade Name", key: "operator_trade_name" },
  { label: "Operation Name", key: "operation_name" },
  { label: "Operation Type", key: "operation_type" },
  { label: "BCGHG ID", key: "operation_bcghgid" },
  { label: "BORO ID", key: "bc_obps_regulated_operation_id" },
  { label: "Reporting activities", key: "activities" },
  { label: "Regulated products", key: "regulated_products" },
];

const personResponsibleFields = [
  { label: "First Name", key: "first_name" },
  { label: "Last Name", key: "last_name" },
  { label: "Job Title / Position", key: "position_title" },
  { label: "Business Email Address", key: "email" },
  { label: "Business Telephone Number", key: "phone_number" },
  { label: "Business Mailing Address", key: "street_address" },
  { label: "Municipality", key: "municipality" },
  { label: "Province", key: "province" },
  { label: "Postal Code", key: "postal_code" },
];

const additionalDataFields = [
  { label: "Did you capture emissions?", key: "capture_emissions" },
  {
    label: "Emissions (t) captured for on-site use",
    key: "emissions_on_site_use",
  },
  {
    label: "Emissions (t) captured for on-site sequestration",
    key: "emissions_on_site_sequestration",
  },
  {
    label: "Emissions (t) captured for off-site transfer",
    key: "emissions_off_site_transfer",
  },
  { heading: "Additional data" },
  { label: "Electricity Generated", key: "electricity_generated", unit: "GWh" },
];

const complianceSummaryFields = (products: any[] = []) => [
  {
    label: "Emissions attributable for reporting",
    key: "emissions_attributable_for_reporting",
    unit: "tCO2e",
  },
  {
    label: "Reporting-only emissions",
    key: "reporting_only_emissions",
    unit: "tCO2e",
  },
  {
    label: "Emissions attributable for compliance",
    key: "emissions_attributable_for_compliance",
    unit: "tCO2e",
  },
  { label: "Emissions limit", key: "emissions_limit", unit: "tCO2e" },
  { label: "Excess emissions", key: "excess_emissions", unit: "tCO2e" },
  { label: "Credited emissions", key: "credited_emissions", unit: "tCO2e" },

  { heading: "Regulatory values" },
  { label: "Reduction factor", key: "regulatory_values.reduction_factor" },
  { label: "Tightening rate", key: "regulatory_values.tightening_rate" },
  {
    label: "Initial compliance period",
    key: "regulatory_values.initial_compliance_period",
  },
  { label: "Compliance period", key: "regulatory_values.compliance_period" },

  ...(products.flatMap((product, index) => [
    { heading: product.name || `Product ${index + 1}` },
    {
      label: "Annual production",
      key: `products.${index}.annual_production`,
      unit: "production unit",
    },
    {
      label: "Production data for Apr 1 - Dec 31 2024",
      key: `products.${index}.apr_dec_production`,
    },
    {
      label: "Production-weighted average emission intensity",
      key: `products.${index}.emission_intensity`,
      unit: "tCO2e/production unit",
    },
    {
      label: "Allocated industrial process emissions",
      key: `products.${index}.allocated_industrial_process_emissions`,
      unit: "tCO2e",
    },
    {
      label: "Allocated Emissions attributable to compliance",
      key: `products.${index}.allocated_compliance_emissions`,
      unit: "tCO2e",
    },
  ]) || []),
];

export const FinalReviewFormNew: React.FC<Props> = ({
  navigationInformation,
  data,
}) => {
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
          <SectionReview
            title="Review Operation Information"
            data={data.report_operation}
            fields={operationFields}
          />

          <SectionReview
            title="Person Responsible for Submitting Report"
            data={data.report_person_responsible}
            fields={personResponsibleFields}
          />

          {data.facility_reports.map(
            (facilityReport: FacilityReport, index) => (
              <SectionReview
                key={facilityReport.facility || index}
                title={`Report Information - ${facilityReport.facility_name}`}
                data={data.report_compliance_summary}
                fields={[]}
                expandable
              >
                <ActivitiesView activity_data={facilityReport.activity_data} />

                {
                  <SectionReview
                    title="Non-Attributable Emissions"
                    data={{}}
                    fields={[]}
                  >
                    <FieldDisplay
                      label={
                        "Did your non-attributable emissions exceed 100 tCO2e?"
                      }
                      value={
                        facilityReport.reportnonattributableemissions_records
                          ?.length > 0
                      }
                    />
                    {facilityReport.reportnonattributableemissions_records
                      ?.length > 0 &&
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
                              facilityReport
                                .reportnonattributableemissions_records.length -
                                1 && <hr className="my-4" />}
                          </div>
                        ),
                      )}
                  </SectionReview>
                }

                <SectionReview
                  title="Emissions Summary (in tCO2e)"
                  data={facilityReport.emission_summary}
                  fields={[
                    {
                      label: "Emissions attributable for reporting",
                      key: "attributable_for_reporting",
                    },
                    {
                      label: "Emissions attributable for reporting threshold",
                      key: "attributable_for_reporting_threshold",
                    },
                    { heading: "Emission Categories" },
                    {
                      label: "Flaring emissions",
                      key: "emission_categories.flaring",
                    },
                    {
                      label: "Fugitive emissions",
                      key: "emission_categories.fugitive",
                    },
                    {
                      label: "Industrial process emissions",
                      key: "emission_categories.industrial_process",
                    },
                    {
                      label: "On-site transportation emissions",
                      key: "emission_categories.onsite_transportation",
                    },
                    {
                      label: "Stationary fuel combustion emissions",
                      key: "emission_categories.stationary_combustion",
                    },
                    {
                      label: "Venting emissions - useful",
                      key: "emission_categories.venting_useful",
                    },
                    {
                      label: "Venting emissions - non-useful",
                      key: "emission_categories.venting_non_useful",
                    },
                    {
                      label: "Emissions from waste",
                      key: "emission_categories.waste",
                    },
                    {
                      label: "Emissions from wastewater",
                      key: "emission_categories.wastewater",
                    },
                    { heading: "Emissions excluded by fuel type" },
                    {
                      label: "CO2 emissions from excluded woody biomass",
                      key: "fuel_excluded.woody_biomass",
                    },
                    {
                      label: "Other emissions from excluded biomass",
                      key: "fuel_excluded.excluded_biomass",
                    },
                    {
                      label: "Emissions from excluded non-biomass",
                      key: "fuel_excluded.excluded_non_biomass",
                    },
                    { heading: "Other emissions excluded" },
                    {
                      label:
                        "Emissions from line tracing and non-processing and non-compression activities",
                      key: "other_excluded.lfo_excluded",
                    },
                  ]}
                />

                <SectionReview
                  title="Production Data"
                  data={facilityReport.report_products}
                  fields={[]}
                >
                  {facilityReport.report_products.map((product) => (
                    <SectionReview
                      key={index}
                      data={product}
                      fields={[
                        { heading: product.product },
                        { label: "Unit", key: "unit" },
                        {
                          label: "Annual Production",
                          key: "annual_production",
                        },
                        {
                          label: "Production Data for Apr 1 - Dec 31 2024",
                          key: "production_data_apr_dec",
                        },
                        {
                          label: "Production Quantification Methodology",
                          key: "production_methodology",
                        },
                        {
                          label:
                            "Quantity in storage at the beginning of the compliance period [Jan 1], if applicable",
                          key: "storage_quantity_start_of_period",
                        },
                        {
                          label:
                            "Quantity in storage at the end of the compliance period [Dec 31], if applicable",
                          key: "storage_quantity_end_of_period",
                        },
                        {
                          label:
                            "Quantity sold during compliance period [Jan 1 - Dec 31], if applicable",
                          key: "quantity_sold_during_period",
                        },
                        {
                          label:
                            "Quantity of throughput at point of sale during compliance period [Jan 1 - Dec 31], if applicable",
                          key: "quantity_throughput_during_period",
                        },
                      ]}
                    />
                  ))}
                </SectionReview>
                <EmissionAllocationView
                  data={facilityReport.report_emission_allocation}
                />
              </SectionReview>
            ),
          )}

          <SectionReview
            title="Additional Reporting Data"
            data={data.report_additional_data}
            fields={additionalDataFields}
          />

          <SectionReview
            title="Compliance Summary"
            data={data.report_compliance_summary}
            fields={complianceSummaryFields(
              data.report_compliance_summary?.products,
            )}
          />

          <ReportingStepButtons
            backUrl={navigationInformation.backUrl}
            continueUrl={navigationInformation.continueUrl}
            buttonText={"Continue"}
            noSaveButton={true}
          />
        </div>
      </div>
    </>
  );
};
