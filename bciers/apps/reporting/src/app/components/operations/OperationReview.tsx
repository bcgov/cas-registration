"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import { actionHandler } from "@bciers/actions";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";

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
}

const baseUrl = "/reports";
const cancelUrl = "/reports";

const taskListElements: TaskListElement[] = [
  {
    type: "Section",
    title: "Operation information",
    isExpanded: true,
    elements: [
      { type: "Page", title: "Review Operation information", isActive: true },
      { type: "Page", title: "Person responsible" },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

export default function OperationReview({
  formData,
  version_id,
  reportType,
  reportingYear,
  allActivities,
  allRegulatedProducts,
}: Props) {
  const router = useRouter();
  const [schema, setSchema] = useState<RJSFSchema>(operationReviewSchema);
  const [uiSchema, setUiSchema] = useState<RJSFSchema>(operationReviewUiSchema);
  const [formDataState, setFormDataState] = useState<any>(formData);
  const queryString = serializeSearchParams(useSearchParams());
  const saveAndContinueUrl = `/reports/${version_id}/person-responsible${queryString}`;

  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );

  // Function to handle form data submission
  const submitHandler = async (
    data: { formData?: any },
    reportVersionId: number,
  ) => {
    const method = "POST";
    const endpoint = `reporting/report-version/${reportVersionId}/report-operation`;

    const formDataObject = safeJsonParse(JSON.stringify(data.formData));

    // Prepare the data based on the operation report type
    const preparedData = {
      ...formDataObject,
      // Check the report type and set activities and regulated_products to empty arrays if it's a simple report
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

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(preparedData),
    });

    if (response) {
      router.push(saveAndContinueUrl); // Navigate on success
    }
  };

  // Function to handle changes in the form data
  const onChangeHandler = (data: { formData: any }) => {
    const updatedData = {
      ...data.formData,
      // Modify the structure of form data here as needed
    };

    setFormDataState(updatedData); // Update the state with modified data
  };

  useEffect(() => {
    if (!formData || !allActivities || !allRegulatedProducts) {
      return;
    }

    const updatedFormData = {
      ...formData,
      operation_report_type: reportType?.report_type || "Annual Report",
      activities: formData.activities || [],
      regulated_products: formData.regulated_products || [],
    };

    setFormDataState(updatedFormData);
  }, [formData, reportType, allActivities, allRegulatedProducts]);

  useEffect(() => {
    setSchema((prevSchema) => ({
      ...prevSchema,
      properties: {
        ...prevSchema.properties,
        operation_report_type: {
          type: "string",
          title: "Please select what type of report you are filling",
          enum: ["Annual Report", "Simple Report"],
          default: formDataState?.operation_report_type || "Annual Report",
        },
        // Conditionally render fields based on report type
        activities: {
          type: "array",
          title: "Reporting activities",
          items: {
            type: "number",
            enum: allActivities.map((activity) => activity.id),
            enumNames: allActivities.map((activity) => activity.name),
          },
          uniqueItems: true,
          // Only show this field if report type is not simple
          "ui:options": {
            hidden: formDataState.operation_report_type === "Simple Report",
          },
        },
        regulated_products: {
          type: "array",
          title: "Regulated products",
          items: {
            type: "number",
            enum: allRegulatedProducts.map((product) => product.id),
            enumNames: allRegulatedProducts.map((product) => product.name),
          },
          uniqueItems: true,
          // Only show this field if report type is not simple
          "ui:options": {
            hidden: formDataState.operation_report_type === "Simple Report",
          },
        },
        operation_representative_name: {
          type: "string",
          title: "Operation representative",
          enum: [formDataState.operation_representative_name || ""],
        },
        operation_type: {
          type: "string",
          title: "Operation type",
          enum: [formDataState.operation_type || ""],
        },
        date_info: {
          type: "object",
          readOnly: true,
          title: `Please ensure this information was accurate for ${reportingWindowEnd}`,
        },
      },
    }));
  }, [allActivities, allRegulatedProducts, formDataState, reportingWindowEnd]);

  useEffect(() => {
    const updateUiSchema = () => {
      const helperText =
        formDataState?.operation_report_type === "Simple Report" ? (
          <small>
            Regulated or Reporting Operations should file a Simple Report if
            their emissions have dropped below 10,000 tCO2e. They will continue
            to report using the Simple Report form until they stop Schedule A
            activities or stay under 10ktCO2e for three years. This does not
            apply to Opt-ins.
          </small>
        ) : null;

      setUiSchema({
        ...operationReviewUiSchema,
        operation_report_type: {
          "ui:widget": "select", // Set the widget type
          "ui:help": helperText,
        },
      });
    };

    // Call the function to update the UI schema
    updateUiSchema();
  }, [formDataState]); // Ensure the effect runs when formDataState changes

  if (!formData) {
    return <div>No version ID found(TBD)</div>;
  }

  return (
    <MultiStepFormWithTaskList
      initialStep={0}
      steps={[
        "Operation Information",
        "Facilities Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={uiSchema}
      formData={formDataState}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onSubmit={(data) => submitHandler(data, version_id)}
      onChange={onChangeHandler} // Pass the onChange handler here
    />
  );
}
