"use client";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { Alert, Button } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { FuelFields } from "./customFields/FuelFieldComponent";
import { FieldProps, RJSFSchema } from "@rjsf/utils";
import { getUiSchema } from "./uiSchemas/schemaMaps";
import { UUID } from "crypto";
import { withTheme } from "@rjsf/core";
import formTheme from "@bciers/components/form/theme/defaultTheme";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import debounce from "lodash.debounce";

const Form = withTheme(formTheme);

const CUSTOM_FIELDS = {
  fuelType: (props: FieldProps) => <FuelFields {...props} />,
};

interface Props {
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  activityFormData: object;
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
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);
  const [formState, setFormState] = useState(activityFormData as any);
  const [jsonSchema, setJsonSchema] = useState(initialJsonSchema);
  const [selectedSourceTypeIds, setSelectedSourceTypeIds] = useState(
    initialSelectedSourceTypeIds,
  );

  const { activityId, sourceTypeMap } = activityData;

  useEffect(() => {
    setJsonSchema(initialJsonSchema);
    setFormState(activityFormData);
    setSelectedSourceTypeIds(initialSelectedSourceTypeIds);
  }, [currentActivity.id]);

  const validator = customizeValidator({});

  const fetchSchemaData = async (sourceTypeIds: string[]) => {
    let sourceTypeQueryString = "";
    sourceTypeIds.forEach((id) => {
      sourceTypeQueryString += `&source_types[]=${id}`;
    });
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
    if (selectedSourceTypes.length !== selectedSourceTypeIds.length) {
      const schemaData = await fetchSchemaData(selectedSourceTypes);
      setJsonSchema(safeJsonParse(schemaData).schema);
      setSelectedSourceTypeIds(selectedSourceTypes);
    }
    setFormState(c.formData);
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: any }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);

    const response = await actionHandler(
      `reporting/report-version/${reportVersionId}/facilities/${facilityId}/activity/${activityId}/report-activity`,
      "POST",
      "",
      {
        body: JSON.stringify({
          activity_data: data.formData,
        }),
      },
    );
    setFormState(response);

    // 🛑 Set loading to false after the API call is completed
    setIsLoading(false);

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }
  };

  return (
    <div className="w-full flex flex-row">
      <ReportingTaskList elements={taskListData} />
      <div className="w-full">
        <Form
          schema={jsonSchema}
          fields={CUSTOM_FIELDS}
          formData={formState}
          uiSchema={getUiSchema(currentActivity.slug)}
          validator={validator}
          onChange={debounce(handleFormChange, 200)}
          onError={(e: any) => console.log("ERROR: ", e)}
          onSubmit={submitHandler}
        >
          {errorList.length > 0 &&
            errorList.map((e: any) => (
              <Alert key={e.message} severity="error">
                {e?.stack ?? e.message}
              </Alert>
            ))}
          <div className="flex justify-end gap-3">
            {/* Disable the button when loading or when success state is true */}
            <Button
              variant="contained"
              type="submit"
              aria-disabled={isLoading}
              disabled={isLoading}
            >
              {isSuccess ? "✅ Success" : "Submit"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
