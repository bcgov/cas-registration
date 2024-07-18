"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createRef, useEffect, useState } from "react";
import { Alert, Button } from "@mui/material";
import { IChangeEvent } from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import TaskList from "@bciers/components/form/components/TaskList";
import Snackbar from "@mui/material/Snackbar";
import { GREEN_SNACKBAR_COLOR } from "@bciers/styles";

interface SingleStepTaskListFormProps {
  disabled?: boolean;
  formData: { [key: string]: any };
  onCancel: () => void;
  onChange: (e: IChangeEvent) => void;
  onSubmit: (e: IChangeEvent) => any;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  error?: string;
}

// this generic function spreads the whole of the formData into every section. On submission, we remove extraneous formData from each section using the omitExtraData prop.
const createNestedFormData = (
  formData: { [key: string]: any },
  schema: { [key: string]: any },
) => {
  const nestedSchema: { [key: string]: any } = {};

  Object.keys(schema.properties).forEach((section) => {
    nestedSchema[section] = formData;
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
  disabled, // pass this as true only if you want the form permanently disabled, e.g., it's being viewed by an internal user
  formData: rawFormData,
  onChange,
  onCancel,
  onSubmit,
  schema,
  uiSchema,
  error,
}: SingleStepTaskListFormProps) => {
  const hasFormData = Object.keys(rawFormData).length > 0;
  const formData = hasFormData ? createNestedFormData(rawFormData, schema) : {};
  const [isDisabled, setIsDisabled] = useState(disabled || hasFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLiveValidate, setIsLiveValidate] = useState(false);
  // Form section status to track if each section is validated
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [formSectionStatus, setFormSectionStatus] = useState<{
    [key: string]: boolean;
  }>({});

  const formSections = schema.properties as RJSFSchema;
  const formSectionList = Object.keys(formSections);

  // Create the task list items from form sections
  const taskListItems = formSectionList.map((section) => ({
    section,
    title: formSections[section]?.title,
  }));

  const formRef = createRef<any>();

  // useEffect(() => {
  //   // Do not validate on component mount if there is no formData
  //   if (!formData || Object.keys(formData).length === 0 || !formRef?.current)
  //     return;

  //   // If there is formData, validate the form sections and
  //   // set the formSectionStatus on component mount
  //   const validator = formRef?.current.state.schemaUtils.getValidator();
  //   const errorData = validator.validateFormData(formData, schema);
  //   const errorSchema = errorData.errorSchema;

  //   const formSectionErrorList = formSectionList.reduce(
  //     (acc: { [key: string]: boolean }, section: string) => {
  //       const sectionErrors = errorSchema?.[section] ?? {};
  //       const isValid = Object.keys(sectionErrors).length === 0;
  //       acc[section] = isValid;
  //       return acc;
  //     },
  //     {},
  //   );

  //   setIsLiveValidate(true);
  //   setFormSectionStatus(formSectionErrorList);
  // }, []);

  // Set isSubmitting to true to disable submit buttons and prevent multiple form submissions
  const submitHandler = async (e: IChangeEvent) => {
    setIsSubmitting(true);
    e.formData = createUnnestedFormData(e.formData, formSectionList);
    const response = await onSubmit(e); // Pass the event to the parent component
    setIsSubmitting(false);
    if (response?.error) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
      // we only show the snackbar confirmation when editing
      if (hasFormData) setIsSnackbarOpen(true);
    }
  };

  // const handleFormChange = (e: IChangeEvent) => {
  //   // ⚠️ Warning ⚠️ - be mindful of performance issues using this with complex forms

  //   // Use schemaUtils validator to validate form data but not trigger validation
  //   // So that we can validate the task list sections separately
  //   const validator = e.schemaUtils.getValidator();
  //   const errorData = validator.validateFormData(e.formData, e.schema);
  //   const errorSchema = errorData.errorSchema;

  //   // Get the section keys from the error schema and set the newSectionErrorList
  //   const newSectionErrorList = Object.keys(errorSchema).reduce(
  //     (acc: { [key: string]: boolean }, section: string) => {
  //       acc[section] = false;
  //       return acc;
  //     },
  //     {},
  //   );

  //   // Re-validate the errors in the previous state and update the newSectionErrorList
  //   Object.keys(formSectionStatus).forEach((section) => {
  //     const sectionErrors = errorSchema?.[section] ?? {};
  //     const isValid = Object.keys(sectionErrors).length === 0;
  //     newSectionErrorList[section] = isValid;
  //   });

  //   setFormSectionStatus(newSectionErrorList);
  // };

  // const handleError = () => {
  //   // Enable live validation on first error eg. onSubmit with empty required fields
  //   // if (!isLiveValidate) setIsLiveValidate(true);

  // };
  const isFormDisabled = disabled || isDisabled || isSubmitting;

  return (
    <div className="w-full flex flex-row mt-8">
      <Snackbar
        open={isSnackbarOpen}
        message="Your edits were saved successfully"
        autoHideDuration={5000}
        onClose={() => setIsSnackbarOpen(false)}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: GREEN_SNACKBAR_COLOR,
          },
        }}
      />
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
          // onChange={handleFormChange}
          // onError={handleError}
          onSubmit={submitHandler}
          liveValidate={isLiveValidate && !isFormDisabled}
          omitExtraData={true}
        >
          <div className="min-h-6">
            {error && <Alert severity="error">{error}</Alert>}
          </div>
          <div className="w-full flex justify-end mt-8">
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
              <Button variant="contained" type="submit" disabled={isSubmitting}>
                Submit
              </Button>
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
