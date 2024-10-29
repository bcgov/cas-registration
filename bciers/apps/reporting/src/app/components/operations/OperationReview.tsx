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
  reportingYear,
  allActivities,
  allRegulatedProducts,
}: Props) {
  const router = useRouter();
  const [schema, setSchema] = useState<RJSFSchema>(operationReviewSchema);
  const [formDataState, setFormDataState] = useState<any>(formData);
  const queryString = serializeSearchParams(useSearchParams());
  const saveAndContinueUrl = `/reports/${version_id}/person-responsible${queryString}`;

  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );

  const submitHandler = async (
    data: { formData?: any },
    reportVersionId: number,
  ) => {
    const method = "POST";
    const endpoint = `reporting/report-version/${reportVersionId}/report-operation`;

    const formDataObject = safeJsonParse(JSON.stringify(data.formData));

    const preparedData = {
      ...formDataObject,
      activities: formDataObject.activities?.map((activityId: any) => {
        const activity = allActivities.find((a) => a.id === activityId);
        if (!activity)
          throw new Error(`Activity with ID ${activityId} not found`);
        return activity.name;
      }),
      regulated_products: formDataObject.regulated_products?.map(
        (productId: any) => {
          const product = allRegulatedProducts.find((p) => p.id === productId);
          if (!product)
            throw new Error(`Product with ID ${productId} not found`);
          return product.name;
        },
      ),
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(preparedData),
    });

    if (response) {
      router.push(saveAndContinueUrl); // Navigate on success
    }
  };

  useEffect(() => {
    if (!formData || !allActivities || !allRegulatedProducts) {
      return;
    }

    const activities = formData.activities || [];
    const products = formData.regulated_products || [];

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
      activities,
      regulated_products: products,
    };

    setFormDataState(updatedFormData);
  }, [allActivities, allRegulatedProducts, formData, reportingWindowEnd]);

  if (!formData) {
    //we need to render another component which we would display if no version Id exist or we want to show an error
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
      uiSchema={operationReviewUiSchema}
      formData={formDataState}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onSubmit={(data) => submitHandler(data, version_id)}
    />
  );
}
