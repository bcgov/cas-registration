"use client";

import React, { useEffect, useState } from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { RJSFSchema } from "@rjsf/utils";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { useRouter } from "next/navigation";
import {
  additionalReportingDataSchema,
  additionalReportingDataUiSchema,
} from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { getRegistrationPurpose } from "@reporting/src/app/utils/getRegistrationPurpose";
import { actionHandler } from "@bciers/actions";

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
  ); // Initialize with base schema
  const router = useRouter();

  const saveAndContinueUrl = `/reports/${versionId}/new-entrant-information`;

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
  ];

  useEffect(() => {
    const getRegistrationPurposes = async () => {
      const result = await getRegistrationPurpose(versionId);
      const registrationPurpose = result?.registration_purposes;

      if (
        registrationPurpose?.length === 1 &&
        registrationPurpose[0] === "Reporting Operation"
      ) {
        setSchema((prevSchema) => {
          const dependencies = prevSchema.dependencies || {};
          const captureEmissions =
            typeof dependencies.capture_emissions === "object" &&
            dependencies.capture_emissions !== null
              ? dependencies.capture_emissions
              : {};

          return {
            ...prevSchema,
            dependencies: {
              ...dependencies,
              capture_emissions: {
                ...captureEmissions,
                oneOf:
                  captureEmissions.oneOf?.map(
                    (item: {
                      properties: { capture_emissions: { enum: boolean[] } };
                    }) => {
                      if (
                        item.properties &&
                        item.properties.capture_emissions?.enum[0] === true
                      ) {
                        return {
                          ...item,
                          properties: {
                            ...item.properties,
                            electricity_generated: {
                              type: "string",
                              title: "Electricity generated",
                            },
                          },
                        };
                      }
                      return item;
                    },
                  ) || [],
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
      ...data,
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });
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
      schema={schema} // Use the modified schema
      uiSchema={additionalReportingDataUiSchema}
      formData={formData}
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={(data: any) => {
        setFormData(data.formData);
      }}
      onSubmit={(data: any) => {
        handleSubmit(data.formData);
      }}
    />
  );
}
