"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { RJSFSchema } from "@rjsf/utils";
import {
  operationReviewSchema,
  operationReviewUiSchema,
  updateSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { actionHandler } from "@bciers/actions";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import {
  ActivePage,
  getOperationInformationTaskList,
} from "../taskList/1_operationInformation";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";

interface Props {
  formData: any;
  version_id: number;
  reportType: {
    report_type: string;
  };
  reportingYear: {
    reporting_year: number;
    report_due_date: string;
    reporting_window_end: string;
  };
  allActivities: { id: number; name: string }[];
  allRegulatedProducts: { id: number; name: string }[];
  registrationPurpose: string;
  facilityReport: {
    facility_id: string;
    operation_type: string;
  };
}

export default function OperationReview({
  formData,
  version_id,
  reportType,
  reportingYear,
  allActivities,
  allRegulatedProducts,
  registrationPurpose,
  facilityReport,
}: Props) {
  const [pendingChangeReportType, setPendingChangeReportType] =
    useState<string>();
  const [schema, setSchema] = useState<RJSFSchema>(operationReviewSchema);
  const [uiSchema, setUiSchema] = useState<RJSFSchema>(operationReviewUiSchema);
  const [formDataState, setFormDataState] = useState<any>(formData);
  const [facilityId, setFacilityId] = useState<string | null>(null);

  // 🛸 Set up routing urls
  const backUrl = `/reports`;
  const saveAndContinueUrl = `/reports/${version_id}/person-responsible`;

  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );

  const taskListElements = getOperationInformationTaskList(
    version_id,
    facilityId,
    ActivePage.ReviewOperatorInfo,
  );

  const prepareFormData = (formDataObject: any) => {
    return {
      ...formDataObject,
      activities:
        formDataState.operation_report_type === "Simple Report"
          ? []
          : formDataObject.activities?.map((activityId: any) => {
              const activity = allActivities.find((a) => a.id === activityId);
              if (!activity)
                throw new Error(`Activity with ID ${activityId} not found`);
              return activity.name;
            }),
      regulated_products:
        formDataState.operation_report_type === "Simple Report"
          ? []
          : formDataObject.regulated_products?.map((productId: any) => {
              const product = allRegulatedProducts.find(
                (p) => p.id === productId,
              );
              if (!product)
                throw new Error(`Product with ID ${productId} not found`);
              return product.name;
            }),
    };
  };

  useEffect(() => {
    if (formData && allActivities && allRegulatedProducts) {
      const updatedFormData = {
        ...formData,
        operation_report_type: reportType?.report_type || "Annual Report",
        activities: formData.activities || [],
        regulated_products: formData.regulated_products || [],
      };
      setFormDataState(updatedFormData);

      setSchema((prevSchema) =>
        updateSchema(
          prevSchema,
          updatedFormData,
          registrationPurpose,
          reportingWindowEnd,
          allActivities,
          allRegulatedProducts,
        ),
      );
    }
    if (facilityReport?.facility_id) {
      setFacilityId(facilityReport.facility_id);
    }
  }, [
    formData,
    reportType,
    facilityReport,
    allActivities,
    allRegulatedProducts,
    registrationPurpose,
    reportingWindowEnd,
  ]);

  const saveHandler = async (
    data: { formData?: any },
    reportVersionId: number,
  ) => {
    const method = "POST";
    const endpoint = `reporting/report-version/${reportVersionId}/report-operation`;

    const formDataObject = safeJsonParse(JSON.stringify(data.formData));
    const preparedData = prepareFormData(formDataObject);
    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(preparedData),
    });

    return response;
  };

  const onChangeHandler = (data: { formData: any }) => {
    const updatedFormData = data.formData;

    if (
      formDataState.operation_report_type !== undefined &&
      formDataState.operation_report_type !==
        updatedFormData.operation_report_type
    ) {
      setPendingChangeReportType(updatedFormData.operation_report_type);
      updatedFormData.operation_report_type =
        formDataState.operation_report_type;
    }

    const helperText =
      updatedFormData.operation_report_type === "Simple Report" ? (
        <small>
          Simple Reports are submitted by reporting operations that previously
          emitted greater than or equal to 10 000 tCO2e of attributable
          emissions in a reporting period, but now emit under 10 000 tCO2e of
          attributable emissions and have an obligation to continue reporting
          emissions for three consecutive reporting periods. This report type is
          not applicable for any operations that received third party
          verification in the immediately preceding reporting period, and is not
          applicable for opted-in operations.
        </small>
      ) : (
        ""
      );

    setUiSchema({
      ...operationReviewUiSchema,
      operation_report_type: {
        "ui:widget": "select",
        "ui:help": helperText,
      },
    });

    setFormDataState(updatedFormData);
  };

  if (!formData) {
    return <div>No version ID found (TBD)</div>;
  }

  const confirmReportTypeChange = () => {
    setFormDataState({
      ...formDataState,
      operation_report_type: pendingChangeReportType,
    });
    setPendingChangeReportType(undefined);
  };
  const cancelReportTypeChange = () => {
    setPendingChangeReportType(undefined);
  };

  return (
    <>
      <SimpleModal
        title="Confirmation"
        open={pendingChangeReportType !== undefined}
        onCancel={cancelReportTypeChange}
        onConfirm={confirmReportTypeChange}
        confirmText="Change report type"
      >
        <p>
          Are you sure you want to change your report type? If you proceed, all
          of the form data you have entered will be lost upon saving.
        </p>
      </SimpleModal>
      <MultiStepFormWithTaskList
        initialStep={0}
        steps={multiStepHeaderSteps}
        taskListElements={taskListElements}
        schema={schema}
        uiSchema={uiSchema}
        formData={formDataState}
        onSubmit={(data: { formData?: any }) => saveHandler(data, version_id)}
        onChange={onChangeHandler}
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
      />
    </>
  );
}
