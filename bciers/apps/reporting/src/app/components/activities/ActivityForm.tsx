"use client";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { FuelFields } from "./customFields/FuelFieldComponent";
import { FieldProps, RJSFSchema } from "@rjsf/utils";
import { getUiSchema } from "./uiSchemas/schemaMaps";
import { UUID } from "crypto";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import debounce from "lodash.debounce";
import { useSearchParams } from "next/navigation";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { customizeValidator } from "@rjsf/validator-ajv8";
import setNestedErrorForCustomValidate from "@bciers/utils/src/setCustomValidateErrors";
import { findPathsWithNegativeNumbers } from "@bciers/utils/src/findInObject";
import { calculateMobileAnnualAmount } from "@bciers/utils/src/customReportingActivityFormCalculations";

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
  taskListData: TaskListElement[];
  reportVersionId: number;
  facilityId: UUID;
  initialJsonSchema: RJSFSchema;
  initialSelectedSourceTypeIds: string[];
  isLinearOperation: boolean;
}

// 🧩 Main component
export default function ActivityForm({
  activityData,
  activityFormData,
  currentActivity,
  taskListData,
  reportVersionId,
  facilityId,
  initialJsonSchema,
  initialSelectedSourceTypeIds,
  isLinearOperation,
}: Readonly<Props>) {
  const searchParams = useSearchParams(); // is read-only
  let step = searchParams ? Number(searchParams.get("step")) : 0;
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

  const createUrl = (isContinue: boolean) => {
    const activitiesSection = taskListData
      .flatMap((taskListElement) => taskListElement.elements || [])
      .find((element) => element.title === "Activities information");

    const taskListLength = activitiesSection?.elements?.length;
    if (taskListLength && step === -1) step = taskListLength - 1;

    if (step === 0 && !isContinue) {
      if (isLinearOperation) {
        return `/reports/${reportVersionId}/facilities/${facilityId}/review-facility-information`;
      }
      return `/reports/${reportVersionId}/person-responsible`; // Facility review page
    }
    if (taskListLength && step + 1 >= taskListLength && isContinue) {
      return "non-attributable"; // Activities done, go to Non-attributable emissions
    }

    const params = new URLSearchParams(
      searchParams ? searchParams.toString() : "",
    );
    const addition = isContinue ? 1 : -1;
    params.set("step", (step + addition).toString());
    params.delete("activity_id");

    return `activities?${params.toString()}`;
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async () => {
    setErrorList([]);

    const sourceTypeCount = Object.keys(sourceTypeMap).length;
    const selectedSourceTypeData = Object.keys(formState.sourceTypes);

    // Only filter the keys where the checkBox for that source type is checked IF there is more than one source type
    const selectedSourceTypeDataFiltered =
      sourceTypeCount > 1
        ? selectedSourceTypeData.filter((slug) => formState[slug])
        : selectedSourceTypeData;

    // Only for selected source types we grab the form data
    const selectedSourceTypeDataReduced = selectedSourceTypeDataFiltered.reduce(
      (filteredSourceTypeData, slug) => {
        filteredSourceTypeData[slug] = formState.sourceTypes[slug];
        return filteredSourceTypeData;
      },
      {} as any,
    );

    const submittedData = {
      ...formState,
      sourceTypes: selectedSourceTypeDataReduced,
    };

    const response = await actionHandler(
      `reporting/report-version/${reportVersionId}/facilities/${facilityId}/activity/${activityId}/report-activity`,
      "POST",
      "",
      {
        body: JSON.stringify({
          /* formState needs to be used instead of the data passed to the handler, since this is a controlled component;
             otherwise the data passed to the handler lags behind the changes.
             See FormBase implementation comments for more details. */
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
      steps={multiStepHeaderSteps}
      initialStep={1}
      taskListElements={taskListData}
      onSubmit={submitHandler}
      schema={jsonSchema}
      fields={CUSTOM_FIELDS}
      formData={formState}
      uiSchema={getUiSchema(currentActivity.slug)}
      onChange={debounce(handleFormChange, 200)}
      errors={errorList}
      backUrl={createUrl(false)}
      continueUrl={createUrl(true)}
      validator={customizeValidator({})}
      customValidate={customValidate}
      omitExtraData={false}
    />
  );
}
