"use client";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { useEffect, useRef, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { Alert } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { FuelFields } from "./customFields/FuelFieldComponent";
import { FieldProps, RJSFSchema } from "@rjsf/utils";
import { getUiSchema } from "./uiSchemas/schemaMaps";
import { UUID } from "crypto";
import FormContext, { withTheme } from "@rjsf/core";
import formTheme from "@bciers/components/form/theme/defaultTheme";
import safeJsonParse from "@bciers/utils/src/safeJsonParse";
import debounce from "lodash.debounce";
import ReportingStepButtons from "@bciers/components/form/components/ReportingStepButtons";
import { useRouter, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams(); // is read-only
  let step = Number(useSearchParams().get("step")) || 0;
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formState, setFormState] = useState(activityFormData as any);
  const [jsonSchema, setJsonSchema] = useState(initialJsonSchema);
  const [selectedSourceTypeIds, setSelectedSourceTypeIds] = useState(
    initialSelectedSourceTypeIds,
  );
  const [canContinue, setCanContinue] = useState<boolean>(false);
  const router = useRouter();

  const { activityId, sourceTypeMap } = activityData;
  const formRef = useRef<FormContext>(null);

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

  const validator = customizeValidator({});

  const fetchSchemaData = async (sourceTypeIds: string[]) => {
    const sourceTypeQueryString = sourceTypeIds
      .map((id) => `&source_types[]=${id}`)
      .join();
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
    if (response) {
      if (canContinue) {
        setIsRedirecting(true);
        router.push(createUrl(true));
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    }
  };

  const submitExternallyToContinue = () => {
    setCanContinue(true);
  }; // Only submit after canContinue is set so the submitHandler can read the boolean
  useEffect(() => {
    if (formRef.current && canContinue) {
      formRef.current.submit();
    }
  }, [canContinue]);

  const createUrl = (isContinue: boolean) => {
    const taskListLength = taskListData.find((taskListElement) => {
      return taskListElement.title === "Activities Information";
    })?.elements?.length;
    if (taskListLength && step === -1) step = taskListLength - 1;

    if (step === 0 && !isContinue)
      return `/reports/${reportVersionId}/facilities/${facilityId}/review?facilities_title=Facility`; // Facility review page
    if (taskListLength && step + 1 >= taskListLength && isContinue)
      return "non-attributable"; // Activities done, go to Non-attributable emissions

    const params = new URLSearchParams(searchParams.toString());
    const addition = isContinue ? 1 : -1;
    params.set("step", (step + addition).toString());
    params.delete("activity_id");

    return `activities?${params.toString()}`;
  };

  return (
    <div className="w-full flex flex-row">
      <ReportingTaskList elements={taskListData} />
      <div className="w-full">
        <Form
          ref={formRef}
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
          <ReportingStepButtons
            backUrl={createUrl(false)}
            continueUrl={createUrl(true)}
            isSaving={isLoading}
            isSuccess={isSuccess}
            saveButtonDisabled={isLoading}
            isRedirecting={isRedirecting}
            saveAndContinue={submitExternallyToContinue}
          />
        </Form>
      </div>
    </div>
  );
}
