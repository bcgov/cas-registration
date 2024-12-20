import { useRef, useState } from "react";
import FormBase, { FormPropsWithTheme } from "./FormBase";
import Form from "@rjsf/core";
import { useRouter } from "next/router";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import ReportingStepButtons from "./components/ReportingStepButtons";
import { Alert } from "@mui/material";

export interface NavigationFormProps extends FormPropsWithTheme<any> {
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formData: any;
  baseUrl?: string;
  cancelUrl?: string;
  backUrl?: string;
  continueUrl: string;
  onSubmit: (data: any) => Promise<boolean>;
  buttonText?: string;
  onChange?: (data: any) => void;
  error?: any;
  saveButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  formContext?: { [key: string]: any }; // used in RJSF schema for access to form data in custom templates
}

const NavigationForm: React.FC<NavigationFormProps> = ({
  schema,
  uiSchema,
  formData,
  backUrl,
  continueUrl,
  onSubmit,
  onChange,
  formContext,
  saveButtonDisabled,
  submitButtonDisabled,
  buttonText,
  error,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const formRef = useRef<Form>(null);
  const router = useRouter();

  const handleFormSave = async (data: any, navigateAfterSubmit: boolean) => {
    setIsSaving(true);
    try {
      await onSubmit(data);
      if (navigateAfterSubmit) {
        setIsRedirecting(true);
        router.push(continueUrl);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch {
      setIsSuccess(false);
      setIsRedirecting(false);
    }
    setIsSaving(false);
  };

  // Essentially a manual call to `submit()` with a context
  const onSaveAndContinue = async () => {
    if (formRef.current?.validateForm())
      await handleFormSave(formRef.current.state.formData, true);
  };

  return (
    <FormBase
      formRef={formRef}
      schema={schema}
      uiSchema={uiSchema}
      onSubmit={(data) => handleFormSave(data, false)}
      formData={formData}
      onChange={onChange}
      formContext={formContext}
    >
      <ReportingStepButtons
        backUrl={backUrl}
        continueUrl={continueUrl}
        isSaving={isSaving}
        isSuccess={isSuccess}
        isRedirecting={isRedirecting}
        saveButtonDisabled={saveButtonDisabled}
        submitButtonDisabled={submitButtonDisabled}
        saveAndContinue={onSaveAndContinue}
        buttonText={buttonText}
      />
      <div className="min-h-[48px] box-border mt-4">
        {error && <Alert severity="error">{error}</Alert>}
      </div>
    </FormBase>
  );
};

export default NavigationForm;
