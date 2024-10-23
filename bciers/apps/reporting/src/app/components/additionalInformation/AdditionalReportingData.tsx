"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter, useSearchParams } from "next/navigation";
import {
  additionalReportingDataSchema,
  additionalReportingDataUiSchema,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { actionHandler } from "@bciers/actions";
import serializeSearchParams from "@bciers/utils/serializeSearchParams";

const baseUrl = "/reports";
const cancelUrl = "/reports";

interface AdditionalReportingDataProps {
  versionId: number;
}

export default function AdditionalReportingData({
  versionId,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<any>({});
  const [schema, setSchema] = useState<RJSFSchema>(
    additionalReportingDataSchema,
  );
  const router = useRouter();
  const queryString = serializeSearchParams(useSearchParams());
  const saveAndContinueUrl = `/reports/${versionId}/new-entrant-information${queryString}`;

  const taskListElements: TaskListElement[] = [
    {
      type: "Page",
      title: "Additional reporting data",
      isActive: true,
      link: `/reports/${versionId}/additional-reporting-data`,
    },
    {
      type: "Page",
      title: "New entrant information",
      link: `/reports/${versionId}/new-entrant-information`,
    },

    {
      type: "Page",
      title: "Operation emission summary",
      link: `/reports/${versionId}/operation-emission-summary`,
    },
  ];

  useEffect(() => {
    const getRegistrationPurposes = async () => {
      const result = await getRegistrationPurpose(versionId);
      const registrationPurpose = result?.registration_purposes;

      if (registrationPurpose?.includes("OBPS Regulated Operation")) {
        setSchema((prevSchema) => {
          // Clone the schema and add the additional data section
          return {
            ...prevSchema,
            properties: {
              ...prevSchema.properties,
              additional_data_section: {
                type: "object",
                title: "Additional data",
                properties: {
                  electricity_generated: {
                    type: "string",
                    title: "Electricity Generated",
                  },
                },
              },
            },
          };
        });
      }
    };

    getRegistrationPurposes();
  }, [versionId]);

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${versionId}/additional-data`;
    const method = "POST";

    const payload = {
      report_version: versionId,
      ...data.captured_emissions_section,
      ...data.additional_data_section,
    };
    console.log("payload", payload);

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });
    console.log("response", response);
    if (response) {
      router.push(`${saveAndContinueUrl}`); // Redirect on success
    }
  };

  return (
    <MultiStepFormWithTaskList
      initialStep={2}
      steps={[
        "Operation Information",
        "Report Information",
        "Additional Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskListElements}
      schema={schema}
      uiSchema={additionalReportingDataUiSchema}
      formData={formData}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => {
        return handleSubmit(data.formData);
      }}
    />
  );
}
