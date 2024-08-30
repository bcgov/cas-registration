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
  const [loading, setLoading] = useState(true);
  const saveAndContinueUrl = `/reporting/reports/${version_id}/person-responsible`;
  const reportingWindowEnd = reportingYear?.reporting_window_end
    ? formatDate(reportingYear.reporting_window_end)
    : null;

  const submitHandler = async (
    data: { formData?: any },
    reportVersionId: number,
  ) => {
    const method = "POST";
    const endpoint = `reporting/report-version/${reportVersionId}/report-operation`;
    const pathToRevalidate = `reporting/report-version/${reportVersionId}/report-operation`;

    // Extract the formData from the input
    const formDataObject = safeJsonParse(JSON.stringify(data.formData));

    // Ensure activities and regulated_products are present and correctly formatted
    const preparedData = {
      ...formDataObject,
      activities: formDataObject.activities?.map((activityId: any) => {
        const activityName = allActivities.find((a) => a.id === activityId)
          ?.name;
        return activityName || activityId;
      }),
      regulated_products: formDataObject.regulated_products?.map(
        (productId: any) => {
          const productName = allRegulatedProducts.find(
            (p) => p.id === productId,
          )?.name;
          return productName || productId;
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
      router.push(saveAndContinueUrl);
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  useEffect(() => {
    if (!formData || !allActivities || !allRegulatedProducts) {
      return;
    }

    const activities = formData.activities || [];
    const products = formData.regulated_products || [];

    const preselectedActivities = activities;
    const preselectedProducts = products;

    setSchema((prevSchema) => ({
      ...prevSchema,
      properties: {
        ...prevSchema.properties,
        activities: {
          type: "array",
          title: "Reporting activities",
          items: {
            type: "number",
            enum: allActivities.map((activity) => activity.id),
            enumNames: allActivities.map((activity) => activity.name),
          },
          uniqueItems: true,
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
          title: `Please ensure this information was accurate for ${reportingWindowEnd}`,
        },
      },
    }));

    const updatedFormData = {
      ...formData,
      activities: preselectedActivities,
      regulated_products: preselectedProducts,
    };

    setFormDataState(updatedFormData);
    setLoading(false);
  }, [allActivities, allRegulatedProducts, formData]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
      onSubmit={(data) => submitHandler(data, version_id)}
    />
  );
}
