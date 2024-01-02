import { useParams, useSearchParams } from "next/navigation";
import { RJSFSchema } from "@rjsf/utils";
import { Alert } from "@mui/material";
import FormBase from "./FormBase";
import MultiStepHeader from "./MultiStepHeader";
import MultiStepButtons from "./MultiStepButtons";

interface MultiStepFormProps {
  baseUrl: string;
  cancelUrl: string;
  error?: any;
  disabled?: boolean;
  formData?: any;
  onSubmit: any;
  schema: any;
  showSubmissionStep?: boolean;
  allowBackNavigation?: boolean;
  uiSchema: any;
}

const MultiStepFormBase = ({
  baseUrl,
  cancelUrl,
  disabled,
  error,
  formData,
  onSubmit,
  schema,
  showSubmissionStep,
  allowBackNavigation,
  uiSchema,
}: MultiStepFormProps) => {
  const params = useParams();
  const formSection =
    parseInt(useSearchParams().get("form-section") as string) ||
    parseInt(params?.formSection as string);
  const formSectionIndex = formSection - 1;

  const formSectionList = Object.keys(schema.properties as any);
  const mapSectionTitles = formSectionList.map(
    (section) => schema.properties[section].title,
  );

  const formSectionTitles = showSubmissionStep
    ? [...mapSectionTitles, "Submission"]
    : mapSectionTitles;

  return (
    <>
      <MultiStepHeader step={formSectionIndex} steps={formSectionTitles} />
      <FormBase
        className="[&>div>fieldset]:min-h-[40vh]"
        schema={
          schema.properties[formSectionList[formSectionIndex]] as RJSFSchema
        }
        uiSchema={uiSchema}
        disabled={disabled}
        readonly={disabled}
        onSubmit={onSubmit}
        formData={formData}
      >
        {error && <Alert severity="error">{error}</Alert>}
        <MultiStepButtons
          disabled={disabled}
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
