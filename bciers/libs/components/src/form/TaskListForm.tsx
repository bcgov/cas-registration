"use client";

import { createRef, useMemo, useState } from "react";
import { Alert, Button } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IChangeEvent } from "@rjsf/core";
import { FieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/components/TaskList";
import { FormMode } from "@bciers/utils/src/enums";
import SubmitButton from "@bciers/components/button/SubmitButton";
import SectionHeaderFieldTemplate from "@bciers/components/form/fields/SectionHeaderFieldTemplate";
import { BC_GOV_SEMANTICS_RED } from "@bciers/styles";

interface TaskListFormProps {
  disabled?: boolean; // pass this as true only if you want the form permanently disabled, e.g., it's being viewed by an internal user
  formData: Record<string, unknown>;
  onCancel: () => void;
  onChange?: (e: IChangeEvent) => void;
  onSubmit: (e: IChangeEvent) => Promise<{ error?: string } | void>;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  error?: string;
  inlineMessage?: React.ReactNode;
  mode?: FormMode;
  allowEdit?: boolean;
  formContext?: Record<string, unknown>;
  showTasklist?: boolean;
  showCancelOrBackButton?: boolean;
  showDeleteButton?: boolean;
  handleDelete?: () => void;
  deleteButtonText?: string;
  customButtonSection?: React.ReactNode;
}

// RJSF ids these `root_<property name>`, which is the anchor TaskList scrolls to
const getTaskListItems = (schema: RJSFSchema, uiSchema: UiSchema) =>
  Object.keys(uiSchema)
    .filter(
      (key) =>
        typeof uiSchema[key] === "object" &&
        uiSchema[key]?.["ui:FieldTemplate"] === SectionHeaderFieldTemplate,
    )
    .map((section) => ({
      section,
      title: (schema.properties as RJSFSchema)?.[section]?.title,
    }));

const RootFieldTemplate = ({ classNames, children }: FieldTemplateProps) => (
  <div className={`w-full ${classNames}`}>{children}</div>
);

const TaskListForm = ({
  disabled,
  formData,
  onChange,
  onCancel,
  onSubmit,
  handleDelete,
  schema,
  uiSchema,
  error,
  inlineMessage,
  mode = FormMode.CREATE,
  allowEdit = true,
  formContext,
  showTasklist = true,
  showCancelOrBackButton = true,
  showDeleteButton = false,
  deleteButtonText = "Delete",
  customButtonSection,
}: TaskListFormProps) => {
  const [formState, setFormState] = useState(formData);
  const [modeState, setModeState] = useState(mode);
  const [isDisabled, setIsDisabled] = useState(
    disabled || mode === FormMode.READ_ONLY,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const taskListItems = getTaskListItems(schema, uiSchema);

  // Spread last so a caller can still supply its own root template
  const formUiSchema = useMemo(
    () => ({ "ui:FieldTemplate": RootFieldTemplate, ...uiSchema }),
    [uiSchema],
  );

  const formRef = createRef<any>();

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (e: IChangeEvent) => {
    setIsSubmitting(true);
    // Update the form state with the new data so we don't use stale data on edit
    setFormState(e.formData);

    const response = await onSubmit(e); // Pass the event to the parent component
    setIsSubmitting(false);
    setIsDisabled(!response?.error);
  };

  const handleFormChange = (e: IChangeEvent) => {
    // ⚠️ Warning ⚠️ - be mindful of performance issues using this with complex forms
    // If onChange is provided, pass the event back to the parent component
    if (onChange) onChange(e);

    setFormState(e.formData);
  };

  const isFormDisabled = disabled || isDisabled || isSubmitting;

  return (
    <div className="w-full flex flex-row mt-8">
      {showTasklist && taskListItems.length > 0 && (
        <TaskList
          className="hidden sm:block sticky top-4 self-start"
          taskListItems={taskListItems}
        />
      )}
      <div className="w-full">
        <FormBase
          formContext={formContext}
          formRef={formRef}
          disabled={isFormDisabled}
          schema={schema}
          uiSchema={formUiSchema}
          formData={formState}
          onChange={handleFormChange}
          onSubmit={(e) => {
            submitHandler(e);
            setModeState(FormMode.READ_ONLY);
          }}
          omitExtraData={true}
        >
          {inlineMessage && <div className="mt-10 mb-5">{inlineMessage}</div>}
          <div className="min-h-6">
            {error && <Alert severity="error">{error}</Alert>}
          </div>
          <div className="w-full flex justify-between items-center mt-8">
            {customButtonSection || (
              <div className="flex items-center">
                {showCancelOrBackButton && (
                  <Button
                    className="mr-4"
                    variant="outlined"
                    type="button"
                    onClick={onCancel}
                  >
                    {modeState === FormMode.EDIT ? "Cancel" : "Back"}
                  </Button>
                )}
                {allowEdit && (
                  <>
                    {isDisabled ? (
                      <Button
                        variant="contained"
                        onClick={() => {
                          setIsDisabled(false);
                          setModeState(FormMode.EDIT);
                        }}
                      >
                        Edit
                      </Button>
                    ) : (
                      <SubmitButton
                        disabled={isSubmitting}
                        isSubmitting={isSubmitting}
                      >
                        Save
                      </SubmitButton>
                    )}
                  </>
                )}
              </div>
            )}

            {showDeleteButton && (
              <Button
                variant="outlined"
                color="error"
                style={{ color: BC_GOV_SEMANTICS_RED }}
                startIcon={<DeleteOutlineIcon />}
                onClick={handleDelete}
              >
                {deleteButtonText}
              </Button>
            )}
          </div>
        </FormBase>
      </div>
    </div>
  );
};

export default TaskListForm;
