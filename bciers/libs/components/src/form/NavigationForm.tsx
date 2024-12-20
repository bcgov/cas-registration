"use client";

import { useRef, useState } from "react";
import FormBase, { FormPropsWithTheme } from "./FormBase";
import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import ReportingStepButtons from "./components/ReportingStepButtons";
import { Alert } from "@mui/material";
import { useRouter } from "next/navigation";

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
  errors?: any[];
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
  errors,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const formRef = useRef<Form>(null);
  const router = useRouter();

  const handleFormSave = async (data: any, navigateAfterSubmit: boolean) => {
    console.log("save", navigateAfterSubmit, continueUrl);

    setIsSaving(true);

    const success = await onSubmit(data);

    console.log("success", success);

    if (success) {
      if (navigateAfterSubmit) {
        setIsRedirecting(true);
        router.push(continueUrl);
      } else {
        setIsSaving(false);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
      return;
    }

    setIsSuccess(false);
    setIsSaving(false);
  };

  // Essentially a manual call to `submit()` with a context
  const onSaveAndContinue = async () => {
    if (formRef.current?.validateForm())
      await handleFormSave(formRef.current.state, true);
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
      {errors && errors.length > 0 && (
        <div className="min-h-[48px] box-border mt-4">
          {errors.map((e) => (
            <Alert severity="error">{e}</Alert>
          ))}
        </div>
      )}
    </FormBase>
  );
};

export default NavigationForm;
