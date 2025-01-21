"use client";
import { useState } from "react";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema } from "@rjsf/utils";
import {
  baseUrlReports,
  cancelUrlReports,
} from "@reporting/src/app/utils/constants";
import { actionHandler } from "@bciers/actions";
import { lfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";
import { sfoUiSchema } from "@reporting/src/data/jsonSchema/verification/verification";

// 🛠️ Function to update the report_verification_visits property in a given formData object
function updateReportVerificationVisits(formData: any): void {
  // Initialize the report_verification_visits array
  formData.report_verification_visits = [];

  // Check if "None" is selected in visit_names
  if (
    Array.isArray(formData.visit_names) &&
    formData.visit_names.includes("None")
  ) {
    formData.report_verification_visits = [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ];
    return; // Exit early as "None" overrides all other data
  } else if (formData.visit_names === "None") {
    formData.report_verification_visits = [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ];
    return; // Exit early as "None" overrides all other data
  }

  // Handle visit_types
  if (Array.isArray(formData.visit_types)) {
    formData.report_verification_visits.push(
      ...formData.visit_types.map((type: any) => ({
        visit_name: type.visit_name || "",
        visit_type: type.visit_type || "",
        is_other_visit: false,
        visit_coordinates: "", // Default for non-other visits
      })),
    );
  } else if (formData.visit_types) {
    // Handle single object scenario for visit_types
    formData.report_verification_visits.push({
      visit_name: formData.visit_types.visit_name || "",
      visit_type: formData.visit_types.visit_type || "",
      is_other_visit: false,
      visit_coordinates: "", // Default for non-other visits
    });
  }

  // Handle visit_others
  if (Array.isArray(formData.visit_others)) {
    formData.report_verification_visits.push(
      ...formData.visit_others.map((other: any) => ({
        visit_name: other.visit_name || "",
        visit_type: other.visit_type || "",
        is_other_visit: true,
        visit_coordinates: other.visit_coordinates || "",
      })),
    );
  } else if (formData.visit_others) {
    // Handle single object scenario for visit_others
    formData.report_verification_visits.push({
      visit_name: formData.visit_others.visit_name || "",
      visit_type: formData.visit_others.visit_type || "",
      is_other_visit: true,
      visit_coordinates: formData.visit_others.visit_coordinates || "",
    });
  }

  // If "None" is found in visit_types or visit_others, override with "None"
  const noneSelectedInVisitTypes = Array.isArray(formData.visit_types)
    ? formData.visit_types.some((type: any) => type.visit_name === "None")
    : formData.visit_types?.visit_name === "None";

  const noneSelectedInVisitOthers = Array.isArray(formData.visit_others)
    ? formData.visit_others.some((other: any) => other.visit_name === "None")
    : formData.visit_others?.visit_name === "None";

  if (noneSelectedInVisitTypes || noneSelectedInVisitOthers) {
    formData.report_verification_visits = [
      {
        visit_name: "None",
        is_other_visit: false,
        visit_coordinates: "",
        visit_type: "",
      },
    ];
  }
}

interface Props {
  version_id: number;
  operationType: string;
  verificationSchema: RJSFSchema;
  initialData: any;
  taskListElements: TaskListElement[];
}

export default function VerificationForm({
  version_id,
  operationType,
  verificationSchema,
  initialData,
  taskListElements,
}: Props) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<string[]>();

  const saveAndContinueUrl = `/reports/${version_id}/attachments`;
  const backUrl = `/reports/${version_id}/compliance-summary`;

  const verificationUiSchema =
    operationType === "SFO" ? sfoUiSchema : lfoUiSchema;

  // 🛠️ Function to handle form changes affecting ui schema
  const handleChange = (e: IChangeEvent) => {
    const updatedData = { ...e.formData };

    // Detect if `visit_names` is an array or a single value
    const isVisitNamesArray = Array.isArray(updatedData.visit_names);

    if (isVisitNamesArray) {
      // LFO scenario
      const selectedValues = updatedData.visit_names;

      if (selectedValues.includes("None")) {
        // If "None" is selected:
        // - Lock selection to only "None"
        updatedData.visit_names = ["None"];

        // - Clear `visit_types` and `visit_others`
        updatedData.visit_types = [];
        updatedData.visit_others = [];
      } else {
        // If "None" is not selected:
        updatedData.visit_names = selectedValues.filter(
          (value: string) => value !== "None",
        );

        // Update `visit_types` for facilities except "Other"
        updatedData.visit_types = updatedData.visit_names
          .filter((visit_name: string) => visit_name !== "Other")
          .map((visit_name: string) => {
            const existingVisitType = updatedData.visit_types?.find(
              (item: { visit_name: string }) => item.visit_name === visit_name,
            );
            return (
              existingVisitType || {
                visit_name,
                visit_type: "",
              }
            );
          });

        // If "Other" is selected, prepare `visit_others`
        if (selectedValues.includes("Other")) {
          updatedData.visit_others = updatedData.visit_others ?? [
            {
              visit_name: "",
              visit_coordinates: "",
              visit_type: "",
            },
          ];
        } else {
          updatedData.visit_others = [{}];
        }
      }
    } else {
      // SFO scenario
      const selectedVisitName = updatedData.visit_names;

      if (selectedVisitName === "None") {
        // If "None" is selected:
        // - Lock selection to "None"
        updatedData.visit_names = "None";

        // - Clear `visit_types` and `visit_others`
        updatedData.visit_types = null;
        updatedData.visit_others = [{}];
      } else if (selectedVisitName) {
        // If a specific visit name is selected (e.g., "Facility X"):
        if (selectedVisitName !== "Other") {
          // Prepare or retain `visit_types`
          updatedData.visit_types = updatedData.visit_types ?? {
            visit_type: "",
          };
          // - Clear `visit_others`
          updatedData.visit_others = [{}];
        } else {
          // If "Other" is selected, clear `visit_types`
          updatedData.visit_types = null;

          // Prepare `visit_others`
          updatedData.visit_others = updatedData.visit_others ?? {
            visit_name: "",
            visit_coordinates: "",
            visit_type: "",
          };
        }
      } else {
        // If no selection is made:
        updatedData.visit_types = null;
        updatedData.visit_others = [{}];
      }
    }

    // 🔄 Update the form data state with the modified data
    setFormData(updatedData);
  };

  // 🛠️ Function to handle form submit
  const handleSubmit = async () => {
    // 📷 Clone formData as payload
    const payload = { ...formData };

    // ➕ Update report_verification_visits property based on visit_types and visit_others
    updateReportVerificationVisits(payload);

    // 🧼 Remove unnecessary properties from payload
    delete payload.visit_names;
    delete payload.visit_types;
    delete payload.visit_others;

    // 🚀 API variables
    const endpoint = `reporting/report-version/${version_id}/report-verification`;
    const method = "POST";
    const pathToRevalidate = "reporting/reports";
    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(payload),
    });
    console.log(JSON.stringify(payload));
    console.log(response);
    // 🐜 Check for errors
    if (response?.error) {
      setErrors([response.error]);
      return false;
    }

    // ✅ Return Success
    setErrors(undefined);
    return true;
  };

  return (
    <MultiStepFormWithTaskList
      steps={multiStepHeaderSteps}
      initialStep={4}
      taskListElements={taskListElements}
      schema={verificationSchema}
      uiSchema={verificationUiSchema}
      formData={formData}
      baseUrl={baseUrlReports}
      cancelUrl={cancelUrlReports}
      backUrl={backUrl}
      onChange={handleChange}
      onSubmit={handleSubmit}
      errors={errors}
      continueUrl={saveAndContinueUrl}
      formContext={{
        visit_types: formData?.visit_types, // set formContext to use in UiSchema
      }}
    />
  );
}
