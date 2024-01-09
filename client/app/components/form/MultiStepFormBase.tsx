"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@mui/material";
import { RJSFSchema } from "@rjsf/utils";
import { Alert } from "@mui/material";
import FormBase from "./FormBase";
import MultiStepHeader from "./MultiStepHeader";
import MultiStepButtons from "./MultiStepButtons";

interface MultiStepFormProps {
  allowBackNavigation?: boolean;
  allowEdit?: boolean;
  baseUrl: string;
  cancelUrl: string;
  error?: any;
  disabled?: boolean;
  formData?: any;
  onSubmit: any;
  schema: any;
  showSubmissionStep?: boolean;
  uiSchema: any;
}

const MultiStepFormBase = ({
  allowBackNavigation,
  allowEdit = false,
  baseUrl,
  cancelUrl,
  disabled,
  error,
  formData,
  onSubmit,
  schema,
  showSubmissionStep,
  uiSchema,
}: MultiStepFormProps) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const params = useParams();
  const formSection = parseInt(params?.formSection as string);
  const formSectionIndex = formSection - 1;

  const formSectionList = Object.keys(schema.properties as any);
  const mapSectionTitles = formSectionList.map(
    (section) => schema.properties[section].title
  );

  const formSectionTitles = showSubmissionStep
    ? [...mapSectionTitles, "Submission"]
    : mapSectionTitles;

  const isFormDisabled = disabled && !isEditMode;

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  return (
    <>
      {allowEdit && (
        <div className="w-full flex justify-end">
          <Button
            variant="contained"
            color="primary"
            disabled={isEditMode}
            onClick={handleEditClick}
          >
            Edit information
          </Button>
        </div>
      )}
      <MultiStepHeader step={formSectionIndex} steps={formSectionTitles} />
      <FormBase
        className="[&>div>fieldset]:min-h-[40vh]"
        schema={
          schema.properties[formSectionList[formSectionIndex]] as RJSFSchema
        }
        uiSchema={uiSchema}
        disabled={isFormDisabled}
        readonly={isFormDisabled}
        onSubmit={onSubmit}
        formData={formData}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <MultiStepButtons
          disabled={isFormDisabled}
          step={formSectionIndex}
          steps={formSectionList}
          baseUrl={baseUrl}
          cancelUrl={cancelUrl}
          allowBackNavigation={allowBackNavigation}
        />
      </FormBase>
    </>
  );
};

export default MultiStepFormBase;
