"use client";
import FormBase from "@bciers/components/form/FormBase";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { Alert, Button } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import safeJsonParse from "@bciers/utils/safeJsonParse";
import { FuelFields } from "./customFields/FuelFieldComponent";
import { FieldProps } from "@rjsf/utils";

const CUSTOM_FIELDS = {
  fuelType: (props: FieldProps) => <FuelFields {...props} />,
};
import { uiSchemaMap } from "./uiSchemas/schemaMaps";

const tasklistData: TaskListElement[] = [
  {
    type: "Page",
    title: "main page element",
  },
  {
    type: "Section",
    title: "Facility 1 info",
    elements: [
      { type: "Page", title: "Review information", isChecked: true },
      {
        type: "Subsection",
        title: "Activities information",
        isExpanded: true,
        elements: [
          {
            type: "Page",
            title: "General stationary combustion excluding line tracing",
          },
          { type: "Page", title: "Mobile combustion", isActive: true },
          { type: "Page", title: "Other 1..", isChecked: true },
        ],
      },
      { type: "Page", title: "Non-attributable emissions" },
    ],
  },
  {
    type: "Section",
    title: "Facility 2 info",
    elements: [
      { type: "Page", title: "Review2 ..." },
      { type: "Page", title: "Other 2.." },
    ],
  },
  {
    type: "Section",
    title: "Facility 3 info",
    isChecked: true,
    elements: [
      { type: "Page", title: "Review3 ..." },
      { type: "Page", title: "Other 3.." },
    ],
  },
  { type: "Page", title: "New entrant information", isChecked: true },
  { type: "Page", title: "Operation emission summary with a long title" },
];

interface Props {
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  reportDate: string;
  defaultEmptySourceTypeState: any;
}

// 🧩 Main component
export default function ActivityForm({
  activityData,
  reportDate,
  defaultEmptySourceTypeState,
}: Readonly<Props>) {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);
  const [formState, setFormState] = useState({} as any);
  const [jsonSchema, setJsonSchema] = useState({});

  const { activityId, sourceTypeMap } = activityData;

  // Get UiSchema from map object
  const uiSchemaName = uiSchemaMap[activityId];
  let uiSchema = require(`./uiSchemas/${uiSchemaName}`).default;

  // Set useEffect dependency set from checked sourceTypes
  const dependencyArray = Object.values(sourceTypeMap).map(
    (v) => formState?.[`${v}`] ?? null,
  );

  useEffect(() => {
    let isFetching = true;
    const fetchSchemaData = async (
      selectedSourceTypes: string,
      selectedKeys: number[],
    ) => {
      // fetch data from server
      const schemaData = await actionHandler(
        `reporting/build-form-schema?activity=${activityId}&report_date=${reportDate}${selectedSourceTypes}`,
        "GET",
        "",
      );
      setJsonSchema(safeJsonParse(schemaData).schema);
      const sourceTypeFormData = (formState?.sourceTypes as any) || {};
      // Add an empty sourceType object by default if there is only one sourceType
      if (Object.entries(sourceTypeMap).length === 1) {
        sourceTypeFormData[`${Object.values(sourceTypeMap)[0]}`] =
          defaultEmptySourceTypeState;
      } else {
        // Add an empty sourceType for each selected Source Type (show first item by default)
        selectedKeys.forEach((k: number) => {
          if (!formState?.sourceTypes[`${sourceTypeMap[k]}`])
            sourceTypeFormData[`${sourceTypeMap[k]}`] =
              defaultEmptySourceTypeState;
        });
      }
      if (isFetching)
        setFormState({ ...formState, sourceTypes: sourceTypeFormData });
    };
    let selectedSourceTypes = "";
    const selectedKeys = [];
    for (const [key, value] of Object.entries(sourceTypeMap)) {
      if (formState?.[`${value}`]) {
        selectedSourceTypes = selectedSourceTypes + `&source_types[]=${key}`;
        selectedKeys.push(Number(key));
      }
    }

    fetchSchemaData(selectedSourceTypes, selectedKeys);
    return () => {
      isFetching = false;
    };
  }, dependencyArray);

  const customFormats = {
    // Add any needed custom formats here like the example below
    // phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  };

  const validator = customizeValidator({ customFormats });

  const handleFormChange = (c: any) => {
    setFormState(c.formData);
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: any }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);
    const response = { status: 200, error: false };
    // 🛑 Set loading to false after the API call is completed
    setIsLoading(false);

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    // Apply new data to NextAuth JWT
    console.log("SUBMITTED: ", JSON.stringify(data.formData));
  };

  if (Object.keys(jsonSchema).length === 0 && jsonSchema.constructor === Object)
    return <>Loading...</>;
  // Render the Activity form and tasklist
  return (
    <div className="w-full flex flex-row">
      <ReportingTaskList elements={tasklistData} />
      <div className="w-full">
        <FormBase
          schema={jsonSchema}
          fields={CUSTOM_FIELDS}
          formData={formState}
          uiSchema={uiSchema}
          validator={validator}
          onChange={handleFormChange}
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
        </FormBase>
      </div>
    </div>
  );
}
