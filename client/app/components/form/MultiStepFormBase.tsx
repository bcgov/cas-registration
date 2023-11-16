import { useState } from "react";
import { useParams } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { Alert } from "@mui/material";
import FormBase from "./FormBase";
import MultiStepHeader from "./MultiStepHeader";
import MultiStepButtons from "./MultiStepButtons";

interface MultiStepFormProps {
  baseUrl: string;
  cancelUrl: string;
  error?: any;
  formData?: any;
  formSectionList: string[];
  onSubmit: any;
  readonly?: boolean;
  schema: any;
  showSubmissionStep?: boolean;
  submitEveryStep?: boolean;
  uiSchema: any;
}

const MultiStepFormBase = ({
  baseUrl,
  cancelUrl,
  error,
  formData,
  formSectionList,
  onSubmit,
  readonly,
  schema,
  showSubmissionStep,
  submitEveryStep,
  uiSchema,
}: MultiStepFormProps) => {
  const params = useParams();
  const formSection = parseInt(params?.formSection as string) - 1;
  const [formState, setFormState] = useState(formData || {});

  const mapSectionTitles = formSectionList.map(
    (section) => schema.properties[section].title,
  );

  const formSectionTitles = showSubmissionStep
    ? [...mapSectionTitles, "Submission"]
    : mapSectionTitles;

  return (
    <>
      <MultiStepHeader step={formSection} steps={formSectionTitles} />
      <FormBase
        className="[&>div>fieldset]:min-h-[40vh]"
        schema={schema.properties[formSectionList[formSection]] as RJSFSchema}
        uiSchema={uiSchema}
        readonly={readonly}
        onSubmit={onSubmit}
        formData={formState}
        onChange={(e) => {
          setFormState({
            ...formState,
            ...e.formData,
          });
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <MultiStepButtons
          step={formSection}
          steps={formSectionList}
          submitEveryStep={submitEveryStep}
          baseUrl={baseUrl}
          cancelUrl={cancelUrl}
        />
      </FormBase>
    </>
  );
};

export default MultiStepFormBase;
