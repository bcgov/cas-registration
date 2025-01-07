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

  const fetchSchemaData = async (sourceTypeIds: string[]) => {
    const sourceTypeQueryString = sourceTypeIds
      .map((id) => `&source_types[]=${id}`)
      .join("");
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
      setJsonSchema(safeJsonParse(schemaData).schema);
      setSelectedSourceTypeIds(selectedSourceTypes);
    }

    setFormState(c.formData);
  };

  const createUrl = (isContinue: boolean) => {
    const taskListLength = taskListData.find((taskListElement) => {
      return taskListElement.title === "Activities Information";
    })?.elements?.length;
    if (taskListLength && step === -1) step = taskListLength - 1;

    if (step === 0 && !isContinue)
      return `/reports/${reportVersionId}/person-responsible`; // Facility review page
    if (taskListLength && step + 1 >= taskListLength && isContinue)
      return "non-attributable"; // Activities done, go to Non-attributable emissions

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

    const selectedSourceTypeData = Object.keys(formState.sourceTypes)
      // Only filter the keys where the checkBox for that source type is checked
      .filter((slug) => formState[slug])
      // Only for selected source types we grab the form data
      .reduce((filteredSourceTypeData, slug) => {
        filteredSourceTypeData[slug] = formState.sourceTypes[slug];
        return filteredSourceTypeData;
      }, {} as any);

    const submittedData = {
      ...formState,
      sourceTypes: selectedSourceTypeData,
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
      omitExtraData={false}
    />
  );
}
