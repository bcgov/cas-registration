"use client";

import { useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import { useRouter, useSearchParams } from "next/navigation";
import {
  baseUrlReports,
  cancelUrlReports,
} from "@reporting/src/app/utils/constants";
import { actionHandler } from "@bciers/actions";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";

interface Props {
  versionId: number;
  verificationSchema: RJSFSchema;
  verificationUiSchema: RJSFSchema;
}
interface FormData {
  name:
    | "verification_body_name"
    | "accredited_by"
    | "scope_of_verification"
    | "visit_name"
    | "visit_type"
    | "other_facility_name"
    | "other_facility_coordinates"
    | "threats_to_independence"
    | "verification_conclusion";
  value: string;
}

export default function VerificationForm({
  versionId,
  verificationSchema,
  verificationUiSchema,
}: Props) {
  const [formData, setFormData] = useState<FormData>();
  const [error, setError] = useState(undefined);
  const searchParams = useSearchParams();
  const queryString = serializeSearchParams(searchParams);
  const taskListElements: TaskListElement[] = [
    {
      type: "Section",
      title: "Sign-off & Submit",
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: "Verification",
          isActive: true,
          link: `/reports/${versionId}/verification${queryString}`,
        },
        {
          type: "Page",
          title: "Attachments",
          link: `/reports/${versionId}/attachment${queryString}`,
        },
        {
          type: "Page",
          title: "Final review",
          link: `/reports/${versionId}/final-review${queryString}`,
        },
        {
          type: "Page",
          title: "Sign-off",
          link: `/reports/${versionId}/sign-off${queryString}`,
        },
      ],
    },
  ];

  const router = useRouter();
  const saveAndContinueUrl = `/reports/${versionId}/attachment${queryString}`;

  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };
    // Update the form state with the modified data
    setFormData(updatedData);
  };

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${versionId}/report-verification`;
    const method = "POST";
    const pathToRevalidate = "reporting/reports";
    const payload = safeJsonParse(JSON.stringify(formData));
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(payload),
    });

    if (response?.error) {
      setError(response.error);
      return;
    } else {
      setError(undefined);
    }

    router.push(saveAndContinueUrl);
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={3}
      steps={[
        "Operation Information",
        "Facilities Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={verificationSchema}
      uiSchema={verificationUiSchema}
      formData={formData}
      baseUrl={baseUrlReports}
      cancelUrl={cancelUrlReports}
      onChange={handleChange}
      onSubmit={handleSubmit}
      error={error}
    />
  );
}
