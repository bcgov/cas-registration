"use client";

import { createRef, useState } from "react";
import { Alert, Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/components/TaskList";
import {
  createNestedFormData,
  createUnnestedFormData,
} from "@bciers/components/form/formDataUtils";
import { FormMode, FrontendMessages } from "@bciers/utils/src/enums";
import SnackBar from "@bciers/components/form/components/SnackBar";
import SubmitButton from "@bciers/components/button/SubmitButton";

interface SingleStepTaskListFormProps {
  disabled?: boolean;
  formData: { [key: string]: any };
  onCancel: () => void;
  onChange?: (e: IChangeEvent) => void;
  onSubmit: (e: IChangeEvent) => any;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  error?: string;
  inlineMessage?: React.ReactNode;
  mode?: FormMode;
  allowEdit?: boolean;
  formContext?: { [key: string]: any };
  showTasklist?: boolean;
  showCancelButton?: boolean;
  customButtonSection?: React.ReactNode;
}

const SingleStepTaskListForm = ({
  disabled, // pass this as true only if you want the form permanently disabled, e.g., it's being viewed by an internal user
  formData: rawFormData,
  onChange,
  onCancel,
  onSubmit,
  schema,
  uiSchema,
  error,
  inlineMessage,
  mode = FormMode.CREATE,
  allowEdit = true,
  formContext,
  showTasklist = true,
  showCancelButton = true,
  customButtonSection,
}: SingleStepTaskListFormProps) => {
  const hasFormData = Object.keys(rawFormData).length > 0;
  const formData = hasFormData ? createNestedFormData(rawFormData, schema) : {};
  const [formState, setFormState] = useState(formData);
  const [isDisabled, setIsDisabled] = useState(
    disabled || mode === FormMode.READ_ONLY,
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

  const isFormDisabled = disabled || isDisabled || isSubmitting;

  return (
    <div className="w-full flex flex-row mt-8">
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message={FrontendMessages.SUBMIT_CONFIRMATION}
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
      {showTasklist && (
        <TaskList
          // Hide the task list on mobile
          className="hidden sm:block"
          taskListItems={taskListItems}
        />
      )}
      <div className="w-full">
        <FormBase
          formContext={formContext}
          formRef={formRef}
          disabled={isFormDisabled}
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
          {customButtonSection || (
            <div className="w-full flex justify-end mt-8">
              {allowEdit && (
                <div>
                  {isDisabled ? (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setIsDisabled(false);
                        setIsSnackbarOpen(false);
                      }}
                    >
                      Edit
                    </Button>
                  ) : (
                    <SubmitButton
                      disabled={isSubmitting}
                      isSubmitting={isSubmitting}
                    >
                      Submit
                    </SubmitButton>
                  )}
                </div>
              )}
              {showCancelButton && (
                <Button
                  className="ml-4"
                  variant="outlined"
                  type="button"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </FormBase>
      </div>
    </div>
  );
};
export default SingleStepTaskListForm;
