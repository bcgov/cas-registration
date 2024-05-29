"use client";

import { createRef, useEffect, useMemo, useRef, useState } from "react";
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
  const [formSectionStatus, setFormSectionStatus] = useState({});

  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);

  const taskListData = formSectionList.map((section) => ({
    section,
    title: formSections[section]?.title,
  }));
  const isDisabled = disabled || isSubmitting;

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (data: any) => {
    setIsSubmitting(true);
    const response = await onSubmit(data);

    // If there is an error, set isSubmitting to false to re-enable submit buttons
    // and allow user to attempt to re-submit the form
    if (response?.error) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-row mt-8">
      <TaskList
        taskListData={taskListData}
        taskListStatus={formSectionStatus}
      />

      <div className="w-full">
        {formSectionList.map((section) => {
          const sectionSchema = (schema.properties as RJSFSchema)[section];

          return (
            <FormBase
              id={section}
              key={section}
              disabled={isDisabled}
              schema={sectionSchema}
              uiSchema={uiSchema}
              formData={formData}
              onSubmit={submitHandler}
              onLiveValidation={(isValid) => {
                setFormSectionStatus({
                  ...formSectionStatus,
                  [section]: isValid,
                });
              }}
              children={true}
            />
          );
        })}
        <SingleStepTaskListButtons
          disabled={isDisabled}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SingleStepTaskListForm;
