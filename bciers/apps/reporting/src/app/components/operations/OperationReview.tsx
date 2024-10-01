"use client";

import React, { ReactElement, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  operationReviewSchema,
  operationReviewUiSchema,
} from "@reporting/src/data/jsonSchema/operations";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import safeJsonParse from "@bciers/utils/safeJsonParse";
import { actionHandler } from "@bciers/actions";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { useFormContext } from "@reporting/src/app/bceidbusiness/industry_user_admin/reports/[version_id]/FormContext";

interface Props {
  existingFormData: any;
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
      { type: "Page", title: "Person responsible", link: "/reports" },
      { type: "Page", title: "Review facilities" },
    ],
  },
];

export default function OperationReview({
  existingFormData,
  version_id,
  reportingYear,
  allActivities,
  allRegulatedProducts,
}: Props): ReactElement {
  const router = useRouter();
  const saveAndContinueUrl = `/reporting/reports/${version_id}/person-responsible`;
  const reportingWindowEnd = formatDate(
    reportingYear.reporting_window_end,
    "MMM DD YYYY",
  );

  const {
    formData,
    setFormData,
    setFormUiSchema,
    setFormSchema,
    setFormSubmitHandler,
  } = useFormContext();

  useEffect(() => {
    const submitHandler = () => async () => {
      const method = "POST";
      const endpoint = `reporting/report-version/${version_id}/report-operation`;

      const formDataObject = safeJsonParse(JSON.stringify(formData));

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
            const product = allRegulatedProducts.find(
              (p) => p.id === productId,
            );
            if (!product)
              throw new Error(`Product with ID ${productId} not found`);
            return product.name;
          },
        ),
      };

      const response = await actionHandler(endpoint, method, endpoint, {
        body: JSON.stringify(preparedData),
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });

      if (response) {
        router.push(saveAndContinueUrl); // Navigate on success
      }
    };
    setFormSubmitHandler(submitHandler);
  }, [formData, version_id]);

  useEffect(() => {
    if (!existingFormData || !allActivities || !allRegulatedProducts) {
      return;
    }

    const activities = existingFormData.activities || [];
    const products = existingFormData.regulated_products || [];

    const newSchema = {
      ...operationReviewSchema,
      properties: {
        ...operationReviewSchema.properties,
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
          enum: [existingFormData.operation_representative_name || ""],
        },
        operation_type: {
          type: "string",
          title: "Operation type",
          enum: [existingFormData.operation_type || ""],
        },
        date_info: {
          type: "object",
          readOnly: true,
          title: `Please ensure this information was accurate for ${reportingWindowEnd}`,
        },
      },
    };

    setFormSchema(newSchema);

    const updatedFormData = {
      ...existingFormData,
      activities,
      regulated_products: products,
    };

    setFormData(updatedFormData);

    setFormUiSchema(operationReviewUiSchema);
  }, [
    allActivities,
    allRegulatedProducts,
    existingFormData,
    reportingWindowEnd,
  ]);

  if (!existingFormData) {
    //we need to render another component which we would display if no version Id exist or we want to show an error
    return <div>No version ID found(TBD)</div>;
  }

  return null;
}
