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
  const queryString = useSearchParams();
  const saveAndContinueUrl = `/reports/${versionId}/new-entrant-information?${queryString}`;

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
            !Array.isArray(dependencies.capture_emissions)
              ? dependencies.capture_emissions
              : {}; // Ensure captureEmissions is an object

          return {
            ...prevSchema,
            dependencies: {
              ...dependencies,
              capture_emissions: {
                ...captureEmissions,
                oneOf:
                  captureEmissions.oneOf?.map((item) => {
                    // Ensure item is an object and has properties
                    if (
                      typeof item === "object" &&
                      item !== null &&
                      "properties" in item
                    ) {
                      const { properties } = item as any; // Cast item to have properties

                      if (
                        properties &&
                        properties.capture_emissions &&
                        Array.isArray(properties.capture_emissions.enum)
                      ) {
                        // Only modify if the first enum value is true
                        if (properties.capture_emissions.enum[0] === true) {
                          return {
                            ...item,
                            properties: {
                              ...properties,
                              electricity_generated: {
                                type: "string",
                                title: "Electricity generated",
                              },
                            },
                          };
                        }
                      }
                    }
                    return item; // Return the original item if conditions aren't met
                  }) || [],
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
        return handleSubmit(data.formData);
      }}
    />
  );
}
