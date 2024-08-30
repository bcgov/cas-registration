"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import safeJsonParse from "@bciers/utils/safeJsonParse";
import { actionHandler } from "@bciers/actions";

interface Props {
  formData: any;
  version_id: number;
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
  allActivities,
  allRegulatedProducts,
}: Props) {
  const [schema, setSchema] = useState<RJSFSchema>(operationReviewSchema);
  const [uiSchema] = useState<any>(operationReviewUiSchema);
  const [formDataState, setFormDataState] = useState<any>(formData);

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
          // Find the activity ID if it's an ID, otherwise map to name
          return allActivities.find((a) => a.name === activity)?.id || activity;
        },
      ),
      regulated_products: formDataObject.regulated_products?.map(
        (product: any) => {
          // Find the product ID if it's an ID, otherwise map to name
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
      // Handle successful save

      // Optionally, you can provide user feedback or navigate to another page
    } catch (error) {}
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
          enum: allActivities.map((activity) => activity.id),
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
          enumNames: [formData.operation_representative_name || ""],
        },
        operation_type: {
          type: "string",
          title: "Operation type",
          enum: [formData.operation_type || ""],
          enumNames: [formData.operation_type || ""],
        },
      },
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
      onSubmit={(data) => submitHandler(data, formData.version_id)} // Pass the version_id to submitHandler
    />
  );
}
