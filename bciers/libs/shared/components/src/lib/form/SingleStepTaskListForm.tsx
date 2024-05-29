"use client";

import { createRef, useEffect, useMemo, useRef, useState } from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@components/form/FormBase";
import TaskList from "@components/form/TaskList";
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

  const taskListData = formSectionList.map((section, index) => ({
    section,
    title: formSections[section]?.title,
    href: `#${index}`,
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
              key={section}
              disabled={isDisabled}
              schema={sectionSchema}
              uiSchema={uiSchema}
              formData={formData}
              onSubmit={submitHandler}
              onValidationSuccess={() => {
                setFormSectionStatus({
                  ...formSectionStatus,
                  [section]: true,
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
