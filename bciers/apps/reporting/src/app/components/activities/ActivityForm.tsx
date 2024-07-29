"use client";
import FormBase from "@bciers/components/form/FormBase";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { Alert, Button } from "@mui/material";
import ReportingTaskList from "@bciers/components/navigation/reportingTaskList/ReportingTaskList";

const data: TaskListElement[] = [
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
            title: "General stationary combustion",
          },
          { type: "Page", title: "Mobile combustion", isActive: true },
          { type: "Page", title: "...", isChecked: true },
        ],
      },
      { type: "Page", title: "Non-attributable emissions" },
    ],
  },
  {
    type: "Section",
    title: "Facility 2 info",
    elements: [
      { type: "Page", title: "Review ..." },
      { type: "Page", title: "..." },
    ],
  },
  {
    type: "Section",
    title: "Facility 3 info",
    isChecked: true,
    elements: [
      { type: "Page", title: "Review ..." },
      { type: "Page", title: "..." },
    ],
  },
  { type: "Page", title: "New entrant information", isChecked: true },
  { type: "Page", title: "Operation emission summary with a long title" },
];

interface Props {
  activityData: {activityId: number, sourceTypeMap:{[key: number]: string}},
  reportDate: string,
  uiSchema: any
}

// 🧩 Main component
export default function ActivityForm({activityData, reportDate, uiSchema}:Readonly<Props>) {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);
  const [formState, setFormState] = useState({} as any)
  const [jsonSchema, setJsonSchema] = useState({})

  const {activityId, sourceTypeMap} = activityData;

  const dependencyArray: string[] = [];
  const checkBooleans = () => {
    for (const [key, value] of Object.entries(sourceTypeMap)) {
      dependencyArray.push(formState?.[`${value}`] ? formState?.[`${value}`] : null)
    }
  }
  checkBooleans();

  useEffect(() => {
    let x;
    const fetchSchemaData = async (selectedSourceTypes: string) => {
      // fetch data from server
      const schemaData = await actionHandler(`reporting/build-form-schema?activity=${activityId}&report_date=${reportDate}${selectedSourceTypes}`, "GET", "");
      setJsonSchema(JSON.parse(schemaData).schema);
      setFormState({...formState, sourceTypes: {gscWithProductionOfUsefulEnergy: {units: [{fuels: [{emissions:[{}]}]}]}, gscWithoutProductionOfUsefulEnergy: {units: [{fuels: [{emissions:[{}]}]}]}}})
    };
    let selectedSourceTypes = '';
    for (const [key, value] of Object.entries(sourceTypeMap)) {
      if (formState?.[`${value}`]) selectedSourceTypes = selectedSourceTypes + `&source_types[]=${key}`;
    }
    fetchSchemaData(selectedSourceTypes);
  }, dependencyArray)

  const customFormats = {
    // Add any needed custom formats here like the example below
    // phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  };

  const validator = customizeValidator({ customFormats });

  const handleFormChange = (c: any) => {
    console.log("IN CHANGE: ", c.formData)
    setFormState(c.formData);
  }

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: any }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);
    const response = {status: 200, error: false}
    // 🛑 Set loading to false after the API call is completed
    setIsLoading(false);

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    // Apply new data to NextAuth JWT
    console.log('SUBMITTED: ', data.formData)
  };

  if (Object.keys(jsonSchema).length === 0 && jsonSchema.constructor === Object) return <>Loading...</>
  // Render the DataGrid component
  return (
    <div className="w-full flex flex-row">
      <ReportingTaskList elements={data} />
      <div className="w-full">
      <FormBase
        schema={jsonSchema}
        formData={formState}
        uiSchema={uiSchema}
        validator={validator}
        onChange={handleFormChange}
        onError={(e: any) => console.log('ERROR: ', e)}
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
