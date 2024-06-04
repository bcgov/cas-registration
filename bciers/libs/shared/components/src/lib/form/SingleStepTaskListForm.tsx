"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/components/TaskList";

interface SingleStepTaskListFormProps {
  disabled?: boolean;
  formData: any;
  onSubmit: (e: IChangeEvent) => Promise<any>;
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

const SingleStepTaskListForm = ({
  disabled,
  formData,
  onSubmit,
  schema,
  uiSchema,
}: SingleStepTaskListFormProps) => {
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

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async () => {
    setIsSubmitting(true);
    const response = await onSubmit(formData);

    // If there is an error, set isSubmitting to false to re-enable submit buttons
    // and allow user to attempt to re-submit the form
    if (response?.error) {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e: IChangeEvent) => {
    // ⚠️ Warning ⚠️ - be mindful of performance issues using this with complex forms

    // Use schemaUtils validator to validate form data but not trigger validation
    // So that we can validate the task list sections separately
    const validator = e.schemaUtils.getValidator();
    const errorData = validator.validateFormData(e.formData, e.schema);
    const errorSchema = errorData.errorSchema;

    // Get the section keys from the error schema and set the newSectionErrorList
    const newSectionErrorList = Object.keys(errorSchema).reduce(
      (acc, section: string) => {
        acc[section] = false;
        return acc;
      },
      {} as { [key: string]: boolean },
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
        taskListItems={taskListItems}
        taskListItemStatus={formSectionStatus}
      />
      <div className="w-full">
        <FormBase
          disabled={isFormDisabled}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={handleFormChange}
          onError={handleError}
          onSubmit={submitHandler}
          liveValidate={isLiveValidate}
        >
          <div className="w-full flex justify-end mt-8">
            <Button variant="contained" type="submit" disabled={isFormDisabled}>
              Submit
            </Button>
            <Button className="ml-4" variant="outlined" type="button">
              Cancel
            </Button>
          </div>
        </FormBase>
      </div>
    </div>
  );
};

export default SingleStepTaskListForm;
