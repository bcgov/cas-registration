"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/taskList/TaskList";

interface SingleStepTaskListFormProps {
  disabled?: boolean;
  formData: any;
  onSubmit: (data: any) => Promise<any>;
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
  // Form section status to track if each section is validated
  const [formSectionStatus, setFormSectionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);
  const taskListData = formSectionList.map((section) => ({
    section,
    title: formSections[section]?.title,
  }));

  const isFormDisabled = disabled || isSubmitting;

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
    // Use schemaUtils validator to validate form data but not trigger validation
    const validator = e.schemaUtils.getValidator();
    const errorData = validator.validateFormData(e.formData, e.schema);

    const errorSchema = errorData.errorSchema;

    const sectionErrorList = Object.keys(errorSchema).reduce(
      (acc, section: string) => {
        acc[section] = false;
        return acc;
      },
      {} as { [key: string]: boolean },
    );

    const newSectionErrorList = {
      ...formSectionStatus,
      ...sectionErrorList,
    };

    // Check if each form section is validated
    Object.keys(newSectionErrorList).forEach((section) => {
      const sectionErrors = errorSchema?.[section];
      const isValid = !sectionErrors || Object.keys(sectionErrors).length === 0;
      newSectionErrorList[section] = isValid;
    });

    setFormSectionStatus(newSectionErrorList);
  };

  return (
    <div className="w-full flex flex-row mt-8">
      <TaskList
        taskListData={taskListData}
        taskListStatus={formSectionStatus}
      />
      <div className="w-full">
        <FormBase
          disabled={isFormDisabled}
          schema={schema}
          uiSchema={uiSchema}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={submitHandler}
        >
          <div className="w-full flex justify-end mt-8">
            <Button variant="contained" type="submit" disabled={disabled}>
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
