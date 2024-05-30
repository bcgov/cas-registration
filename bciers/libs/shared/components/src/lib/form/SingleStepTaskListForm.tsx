"use client";

import { useEffect, useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/TaskList";
import SingleStepTaskListButtons from "./SingleStepTaskListButtons";

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
  const [isAllSectionsValidated, setIsAllSectionsValidated] = useState(false);
  // Form section status to track if each section is validated
  const [formSectionStatus, setFormSectionStatus] = useState<{
    [key: string]: boolean;
  }>({});
  const [formState, setFormState] = useState(formData ?? {});
  const [triggerValidation, setTriggerValidation] = useState(false);

  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);
  const taskListData = formSectionList.map((section) => ({
    section,
    title: formSections[section]?.title,
  }));

  const isFormDisabled = disabled || isSubmitting;

  useEffect(() => {
    // Check if all form sections are validated so we can enable the submit button
    const isValidated = formSectionList.every(
      (section) => formSectionStatus[section],
    );
    setIsAllSectionsValidated(isValidated);
  }, [formSectionStatus]);

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async () => {
    alert("Submitting form data");
    setIsSubmitting(true);
    const response = await onSubmit(formState);

    // If there is an error, set isSubmitting to false to re-enable submit buttons
    // and allow user to attempt to re-submit the form
    if (response?.error) {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e: IChangeEvent) => {
    // Merge section form data into singular form state
    setFormState((prevState: any) => ({
      ...prevState,
      ...e.formData,
    }));
  };

  return (
    <div className="w-full flex flex-row mt-8">
      <TaskList
        taskListData={taskListData}
        taskListStatus={formSectionStatus}
      />

      <div className="w-full">
        {/* FormBase component is used to render each form section */}
        {/* This was done as 'separate forms' so we could individually validate each section for the task list */}
        {formSectionList.map((section) => {
          const sectionSchema = (schema.properties as RJSFSchema)[section];
          return (
            <FormBase
              id={section}
              key={section}
              disabled={isFormDisabled}
              schema={sectionSchema}
              uiSchema={uiSchema}
              formData={formData}
              onChange={(e) => handleFormChange(e)}
              onLiveValidation={(isValid) => {
                setFormSectionStatus({
                  ...formSectionStatus,
                  [section]: isValid,
                });
              }}
              triggerValidation={triggerValidation}
              children={true}
            />
          );
        })}
        <SingleStepTaskListButtons
          disabled={isFormDisabled}
          onSubmit={async () => {
            setTriggerValidation(true);
            if (isAllSectionsValidated) {
              await submitHandler();
            }
          }}
        />
      </div>
    </div>
  );
};

export default SingleStepTaskListForm;
