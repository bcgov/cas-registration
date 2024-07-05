"use client";

import { createRef, useEffect, useState } from "react";
import { Alert, Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/components/TaskList";

interface SingleStepTaskListFormProps {
  disabled?: boolean;
  formData: { [key: string]: any };
  onCancel: () => void;
  onSubmit: (e: IChangeEvent) => Promise<void>;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  error?: string;
}

// this generic function transforms flat form data into sections based on the json schema (this component needs form data to be nested into sections to work)
const createNestedFormData = (
  formData: { [key: string]: any },
  schema: { [key: string]: any },
) => {
  const nestedSchema: { [key: string]: any } = {};

  Object.keys(schema.properties).forEach((section) => {
    nestedSchema[section] = {};
    Object.keys(schema.properties[section].properties).forEach((field) => {
      if (formData.hasOwnProperty(field)) {
        nestedSchema[section][field] = formData[field];
      }
    });
  });

  return nestedSchema;
};

// this generic function flattens sectioned form data (our backend needs flat objects)
const createUnnestedFormData = (
  formData: { [key: string]: any },
  formSectionList: string[],
) => {
  return formSectionList.reduce((acc, section) => {
    acc = { ...acc, ...formData[section] };
    return acc;
  }, {});
};

const SingleStepTaskListForm = ({
  disabled,
  formData: rawFormData,
  onCancel,
  onSubmit,
  schema,
  uiSchema,
  error,
}: SingleStepTaskListFormProps) => {
  const formData =
    Object.keys(rawFormData).length > 0
      ? createNestedFormData(rawFormData, schema)
      : {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiveValidate, setIsLiveValidate] = useState(false);
  // Form section status to track if each section is validated
  const [formSectionStatus, setFormSectionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const isFormDisabled = disabled || isSubmitting;
  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);

  // Create the task list items from form sections
  const taskListItems = formSectionList.map((section) => ({
    section,
    title: formSections[section]?.title,
  }));

  const formRef = createRef<any>();

  useEffect(() => {
    // Do not validate on component mount if there is no formData
    if (!formData || Object.keys(formData).length === 0 || !formRef?.current)
      return;

    // If there is formData, validate the form sections and
    // set the formSectionStatus on component mount
    const validator = formRef?.current.state.schemaUtils.getValidator();
    const errorData = validator.validateFormData(formData, schema);
    const errorSchema = errorData.errorSchema;

    const formSectionErrorList = formSectionList.reduce(
      (acc: { [key: string]: boolean }, section: string) => {
        const sectionErrors = errorSchema?.[section] ?? {};
        const isValid = Object.keys(sectionErrors).length === 0;
        acc[section] = isValid;
        return acc;
      },
      {},
    );

    setIsLiveValidate(true);
    setFormSectionStatus(formSectionErrorList);
  }, []);

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (e: IChangeEvent) => {
    setIsSubmitting(true);
    e.formData = createUnnestedFormData(e.formData, formSectionList);
    const response = await onSubmit(e); // Pass the event to the parent component

    // If there is an error, set isSubmitting to false to re-enable submit buttons
    // and allow user to attempt to re-submit the form
    if (response?.error) {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e: IChangeEvent) => {
    console.log("handleFormChange", e.formData);
    // ⚠️ Warning ⚠️ - be mindful of performance issues using this with complex forms

    // Use schemaUtils validator to validate form data but not trigger validation
    // So that we can validate the task list sections separately
    const validator = e.schemaUtils.getValidator();
    const errorData = validator.validateFormData(e.formData, e.schema);
    const errorSchema = errorData.errorSchema;

    // Get the section keys from the error schema and set the newSectionErrorList
    const newSectionErrorList = Object.keys(errorSchema).reduce(
      (acc: { [key: string]: boolean }, section: string) => {
        acc[section] = false;
        return acc;
      },
      {},
    );

    // Re-validate the errors in the previous state and update the newSectionErrorList
    Object.keys(formSectionStatus).forEach((section) => {
      const sectionErrors = errorSchema?.[section] ?? {};
      const isValid = Object.keys(sectionErrors).length === 0;
      newSectionErrorList[section] = isValid;
    });

    setFormSectionStatus(newSectionErrorList);
  };

  const handleError = () => {
    // Enable live validation on first error eg. onSubmit with empty required fields
    if (!isLiveValidate) setIsLiveValidate(true);
  };

  return (
    <div className="w-full flex flex-row mt-8">
      <TaskList
        // Hide the task list on mobile
        className="hidden sm:block"
        taskListItems={taskListItems}
        taskListItemStatus={formSectionStatus}
      />
      <div className="w-full">
        <FormBase
          formRef={formRef}
          disabled={isFormDisabled}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={handleFormChange}
          onError={handleError}
          onSubmit={submitHandler}
          liveValidate={isLiveValidate}
        >
          <div className="min-h-6">
            {error && <Alert severity="error">{error}</Alert>}
          </div>
          <div className="w-full flex justify-end mt-8">
            <Button variant="contained" type="submit" disabled={isFormDisabled}>
              Submit
            </Button>
            <Button
              className="ml-4"
              variant="outlined"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </FormBase>
      </div>
    </div>
  );
};

export default SingleStepTaskListForm;
