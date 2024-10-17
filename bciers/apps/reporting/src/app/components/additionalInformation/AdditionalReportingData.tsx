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

const taskListElements: TaskListElement[] = [
  { type: "Page", title: "Additional reporting data", isActive: true },
  { type: "Page", title: "New entrant information" },
];

interface AdditionalReportingDataProps {
  version_id: number;
}

export default function AdditionalReportingData({
  version_id,
}: AdditionalReportingDataProps) {
  const [formData, setFormData] = useState<any>({});
  const [schema, setSchema] = useState<RJSFSchema>(
    additionalReportingDataSchema,
  ); // Initialize with base schema
  const router = useRouter();

  const saveAndContinueUrl = `/reports/${version_id}/new-entrant-information`;

  useEffect(() => {
    const getRegistrationPurposes = async () => {
      const result = await getRegistrationPurpose(version_id);
      const registrationPurpose = result?.registration_purposes;
      console.log("reg", result);
      console.log("registration_purpose", registrationPurpose);

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
                              title:
                                "Electricity generated (Optional for reporting only operations)",
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
  }, [version_id]);

  const handleSubmit = async (data: any) => {
    const endpoint = `reporting/report-version/${version_id}/additional-data`;
    const method = "POST";

    const payload = {
      report_version: version_id,
      ...data, // Use the form data passed to this function
    };

    const response = await actionHandler(endpoint, method, endpoint, {
      body: JSON.stringify(payload),
    });

    console.log("Response:", response);

    // Handle response
    if (response) {
      router.push(`${saveAndContinueUrl}`); // Redirect on success
    }
  };

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
      schema={schema} // Use the modified schema
      uiSchema={additionalReportingDataUiSchema}
      formData={formData} // Pass the updated formData to the component
      baseUrl={baseUrl}
      cancelUrl={cancelUrl}
      onChange={(data: any) => {
        setFormData(data.formData); // Sync formData on every change
      }}
      onSubmit={(data: any) => {
        handleSubmit(data.formData); // Call the submit handler directly
      }}
    />
  );
}
