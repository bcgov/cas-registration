"use client";

import { createRef, useState } from "react";
import { Alert, Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/components/TaskList";
import { createNestedFormData, createUnnestedFormData } from "./formDataUtils";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { FrontendMessages } from "@bciers/utils/enums";

interface SingleStepTaskListFormProps {
  allowEdit?: boolean;
  disabled?: boolean;
  error?: string;
  formData: { [key: string]: any };
  inlineMessage?: React.ReactNode;
  onCancel: () => void;
  onChange?: (e: IChangeEvent) => void;
  onSubmit: (e: IChangeEvent) => any;
  readOnly?: boolean;
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

const SingleStepTaskListForm = ({
  allowEdit = true,
  disabled, // If allowEdit is false, disabled prop will permanently disable the form
  formData: rawFormData,
  onChange,
  onCancel,
  onSubmit,
  readOnly,
  schema,
  uiSchema,
  error,
  inlineMessage,
}: SingleStepTaskListFormProps) => {
  const hasFormData = Object.keys(rawFormData).length > 0;
  const formData = hasFormData ? createNestedFormData(rawFormData, schema) : {};
  const [formState, setFormState] = useState(formData);
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [isEditMode, setIsEditMode] = useState(
    allowEdit && !readOnly && !disabled && !hasFormData,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);

  // Create the task list items from form sections
  const taskListItems = formSectionList.map((section) => ({
    section,
    title: formSections[section]?.title,
  }));

  const formRef = createRef<any>();

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (e: IChangeEvent) => {
    setIsSubmitting(true);
    // Update the form state with the new data so we don't use stale data on edit
    setFormState(e.formData);
    e.formData = createUnnestedFormData(e.formData, formSectionList);
    const response = await onSubmit(e); // Pass the event to the parent component
    setIsSubmitting(false);
    if (response?.error) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
      setIsSnackbarOpen(true);
    }
  };

  const handleFormChange = (e: IChangeEvent) => {
    // ⚠️ Warning ⚠️ - be mindful of performance issues using this with complex forms
    // If onChange is provided, pass the event back to the parent component
    if (onChange) onChange(e);
  };

  const isFormDisabled =
    // If editing is not allowed, disabled prop permanently disables the form
    (!allowEdit && disabled) ||
    !isEditMode ||
    isDisabled ||
    isSubmitting ||
    readOnly;

  return (
    <div className="w-full flex flex-row mt-8">
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message={FrontendMessages.SUBMIT_CONFIRMATION}
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
      <TaskList
        // Hide the task list on mobile
        className="hidden sm:block"
        taskListItems={taskListItems}
      />
      <div className="w-full">
        <FormBase
          formRef={formRef}
          disabled={isFormDisabled}
          readonly={readOnly}
          schema={schema}
          uiSchema={uiSchema}
          formData={formState}
          onChange={handleFormChange}
          // onError={handleError}
          onSubmit={submitHandler}
          omitExtraData={true}
        >
          {inlineMessage && <div className="mt-10 mb-5">{inlineMessage}</div>}
          <div className="min-h-6">
            {error && <Alert severity="error">{error}</Alert>}
          </div>
          <div className="w-full flex justify-end mt-8">
            {allowEdit && (
              <div>
                {!isEditMode && !readOnly ? (
                  <Button
                    variant="contained"
                    type="button"
                    disabled={isEditMode}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDisabled(false);
                      setIsSnackbarOpen(false);
                      setIsEditMode(true);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                )}
              </div>
            )}
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
