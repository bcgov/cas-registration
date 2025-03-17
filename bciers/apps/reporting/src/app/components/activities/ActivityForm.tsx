"use client";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { FuelFields } from "./customFields/FuelFieldComponent";
import { FieldProps, RJSFSchema } from "@rjsf/utils";
import { getUiSchema } from "./uiSchemas/schemaMaps";
import { UUID } from "crypto";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import debounce from "lodash.debounce";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { customizeValidator } from "@rjsf/validator-ajv8";
import setNestedErrorForCustomValidate from "@bciers/utils/src/setCustomValidateErrors";
import { findPathsWithNegativeNumbers } from "@bciers/utils/src/findInObject";
import { calculateMobileAnnualAmount } from "@bciers/utils/src/customReportingActivityFormCalculations";
import { IChangeEvent } from "@rjsf/core";
import { NavigationInformation } from "../taskList/types";

const CUSTOM_FIELDS = {
  fuelType: (props: FieldProps) => <FuelFields {...props} />,
};

interface Props {
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  activityFormData: any;
  currentActivity: { id: number; name: string; slug: string };
  navigationInformation: NavigationInformation;
  reportVersionId: number;
  facilityId: UUID;
  initialJsonSchema: RJSFSchema;
  initialSelectedSourceTypeIds: string[];
}

// 🧩 Main component
export default function ActivityForm({
  activityData,
  activityFormData,
  currentActivity,
  navigationInformation,
  reportVersionId,
  facilityId,
  initialJsonSchema,
  initialSelectedSourceTypeIds,
}: Readonly<Props>) {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  const [formState, setFormState] = useState(activityFormData);
  const [jsonSchema, setJsonSchema] = useState(initialJsonSchema);
  const [selectedSourceTypeIds, setSelectedSourceTypeIds] = useState(
    initialSelectedSourceTypeIds,
  );

  const { activityId, sourceTypeMap } = activityData;

  const arrayEquals = (x: string[], y: string[]) => {
    x = x.sort((a, b) => a.localeCompare(b));
    y = y.sort((a, b) => a.localeCompare(b));
    return (
      Array.isArray(x) &&
      Array.isArray(y) &&
      x.length === y.length &&
      x.every((val, index) => val === y[index])
    );
  };

  useEffect(() => {
    setJsonSchema(initialJsonSchema);
    setFormState(activityFormData);
    setSelectedSourceTypeIds(initialSelectedSourceTypeIds);
  }, [currentActivity]);

  const customValidate = (formData: { [key: string]: any }, errors: any) => {
    // Negative numbers
    const results = findPathsWithNegativeNumbers(formData);
    results.forEach((result) => {
      setNestedErrorForCustomValidate(errors, result, "must be >= 0");
    });

    return errors;
  };

  const fetchSchemaData = async (sourceTypeIds: string[]) => {
    const sourceTypeQueryString = sourceTypeIds.length
      ? `&${sourceTypeIds.map((id) => `source_types[]=${id}`).join("&")}`
      : "";
    const schema = await actionHandler(
      `reporting/build-form-schema?activity=${currentActivity.id}&report_version_id=${reportVersionId}${sourceTypeQueryString}`,
      "GET",
      "",
    );
    return schema;
  };

  const handleFormChange = async (c: any) => {
    const selectedSourceTypes = [];
    // Checks for a change in source type selection & fetches the updated schema if they have changed.
    for (const [k, v] of Object.entries(sourceTypeMap)) {
      if (c.formData[`${v}`]) selectedSourceTypes.push(k);
    }
    if (!arrayEquals(selectedSourceTypes, selectedSourceTypeIds)) {
      const schemaData = await fetchSchemaData(selectedSourceTypes);
      if (schemaData.error) {
        setErrorList([schemaData.error]);
        return;
      }
      setJsonSchema(safeJsonParse(schemaData).schema);
      setSelectedSourceTypeIds(selectedSourceTypes);
    }

    // Add together quarterly amounts for Fuel Combustion by Mobile Equipment
    if (c.formData?.sourceTypes?.mobileFuelCombustionPartOfFacility)
      calculateMobileAnnualAmount(c.formData);

    setFormState(c.formData);
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (e: IChangeEvent) => {
    setErrorList([]);
    const sourceTypeCount = Object.keys(sourceTypeMap).length;
    // Ensure we use the filtered formData with omitted extra data
    const filteredData = e.formData;

    if (!filteredData.sourceTypes) {
      setErrorList([
        "At least one source type must be selected to report for that activity.",
      ]);
      return false;
    }

    const selectedSourceTypeData = Object.keys(filteredData.sourceTypes);

    // Only filter the keys where the checkBox for that source type is checked IF there is more than one source type
    const selectedSourceTypeDataFiltered =
      sourceTypeCount > 1
        ? selectedSourceTypeData.filter((slug) => filteredData[slug])
        : selectedSourceTypeData;

    // Only for selected source types we grab the form data
    const selectedSourceTypeDataReduced = selectedSourceTypeDataFiltered.reduce(
      (filteredSourceTypeData, slug) => {
        filteredSourceTypeData[slug] = filteredData.sourceTypes[slug];
        return filteredSourceTypeData;
      },
      {} as any,
    );

    const submittedData = {
      ...filteredData,
      sourceTypes: selectedSourceTypeDataReduced,
    };

    const response = await actionHandler(
      `reporting/report-version/${reportVersionId}/facilities/${facilityId}/activity/${activityId}/report-activity`,
      "POST",
      `reporting/reports/${reportVersionId}/facilities/${facilityId}/activities`,
      {
        body: JSON.stringify({
          activity_data: submittedData,
        }),
      },
    );

    if (response.error) {
      setErrorList([response.error]);
      return false;
    }
    if (response) {
      setFormState(response);
      return true;
    }

    return false;
  };

  return (
    <MultiStepFormWithTaskList
      steps={navigationInformation.headerSteps}
      initialStep={navigationInformation.headerStepIndex}
      taskListElements={navigationInformation.taskList}
      onSubmit={submitHandler}
      schema={jsonSchema}
      fields={CUSTOM_FIELDS}
      formData={formState}
      uiSchema={getUiSchema(currentActivity.slug)}
      onChange={debounce(handleFormChange, 200)}
      errors={errorList}
      backUrl={navigationInformation.backUrl}
      continueUrl={navigationInformation.continueUrl}
      validator={customizeValidator({})}
      customValidate={customValidate}
    />
  );
}
