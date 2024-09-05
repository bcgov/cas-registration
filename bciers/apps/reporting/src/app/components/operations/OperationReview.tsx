"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { useRouter } from "next/navigation";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import safeJsonParse from "@bciers/utils/safeJsonParse";
import { actionHandler } from "@bciers/actions";
import dayjs from "dayjs";

interface Props {
  formData: any;
  version_id: number;
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

const formatDate = (dateString: string | number | Date) => {
  return dayjs(dateString).format("MMM DD YYYY");
};
export default function OperationReview({
  formData,
  version_id,
  reportingYear,
  allActivities,
  allRegulatedProducts,
}: Props) {
  const router = useRouter();
  const [schema, setSchema] = useState<RJSFSchema>(operationReviewSchema);
  const [uiSchema] = useState<any>(operationReviewUiSchema);
  const [formDataState, setFormDataState] = useState<any>(formData);
  const saveAndContinueUrl = `/reporting/reports/${version_id}/person-responsible`;
  const reporting_window_end = reportingYear?.reporting_window_end
    ? formatDate(reportingYear.reporting_window_end)
    : null;

  const submitHandler = async (
    data: { formData?: any },
    version_id: number,
  ) => {
    const method = "POST";
    const endpoint = `reporting/report-version/${version_id}/report-operation`;
    const pathToRevalidate = `reporting/report-version/${version_id}/report-operation`;

    // Extract the formData from the input
    const formDataObject = safeJsonParse(JSON.stringify(data.formData));

    // Prepare the data to be sent to the server
    const preparedData = {
      ...formDataObject,
      reporting_activities: formDataObject.reporting_activities?.map(
        (activity: any) => {
          return allActivities.find((a) => a.name === activity)?.id || activity;
        },
      ),
      regulated_products: formDataObject.regulated_products?.map(
        (product: any) => {
          return (
            allRegulatedProducts.find((p) => p.name === product)?.id || product
          );
        },
      ),
    };

    try {
      await actionHandler(endpoint, method, pathToRevalidate, {
        body: JSON.stringify(preparedData),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      // Navigate to the next URL using Next.js router
      router.push(saveAndContinueUrl);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  useEffect(() => {
    if (!formData) {
      return;
    }
    // Ensure formData fields are arrays
    const activities = formData.activities || [];
    const products = formData.regulated_products || [];

    // Create maps for easy lookups
    const activityMap = new Map(
      allActivities.map((activity) => [activity.id, activity.name]),
    );
    const productMap = new Map(
      allRegulatedProducts.map((product) => [product.id, product.name]),
    );

    // Map IDs to names using the maps, handle missing names by defaulting to ID
    const preselectedActivities = activities.map(
      (id: number) => activityMap.get(id) || id,
    );
    const preselectedProducts = products.map(
      (id: number) => productMap.get(id) || id,
    );

    // Update schema dynamically
    setSchema((prevSchema) => ({
      ...prevSchema,
      properties: {
        ...prevSchema.properties,
        reporting_activities: {
          type: "array",
          title: "Reporting activities",
          items: {
            type: "string",
            enum: allActivities.map((activity) => activity.name),
            enumNames: allActivities.map((activity) => activity.name),
          },
        },
        regulated_products: {
          type: "array",
          title: "Regulated products",
          items: {
            type: "string",
            enum: allRegulatedProducts.map((product) => product.name),
            enumNames: allRegulatedProducts.map((product) => product.name),
          },
        },
        operation_representative_name: {
          type: "string",
          title: "Operation representative",
          enum: [formData.operation_representative_name || ""],
        },
        operation_type: {
          type: "string",
          title: "Operation type",
          enum: [formData.operation_type || ""],
        },
        date_info: {
          type: "object",
          readOnly: true,
          title: `Please ensure this information was accurate for ${reporting_window_end}`,
        },
      },
      required: ["operation_type", "operation_representative_name"], // Add required fields here
    }));

    // Ensure formData is updated with preselected values
    const updatedFormData = {
      ...formData,
      reporting_activities: preselectedActivities,
      regulated_products: preselectedProducts,
    };

    setFormDataState(updatedFormData);
  }, [allActivities, allRegulatedProducts, formData]);

  if (!formData || formData.error) {
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
      saveAndContinueUrl={saveAndContinueUrl}
      onSubmit={(data) => submitHandler(data, formData.version_id)}
    />
  );
}
