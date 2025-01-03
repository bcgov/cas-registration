"use client";

import { useEffect, useRef, useState } from "react";
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

const useKey: () => [number, () => void] = () => {
  /**
   * Utility to manage a state meant to be used as a unique key to drive re-rendering of a component.
   * Guaranteed to generate a different 'key' every time 'resetKey()' is called, by incrementing the previous value.
   *
   * Note: This is meant to be temporary until the implications of removing the FormBase `isSubmitting` guard
   * on its formData are understood.
   */
  const [key, setKey] = useState(1);
  const resetKey = () => setKey((prevKey) => prevKey + 1);
  return [key, resetKey];
};

const NavigationForm: React.FC<NavigationFormProps> = (props) => {
  const {
    backUrl,
    continueUrl,
    onSubmit,
    saveButtonDisabled,
    submitButtonDisabled,
    buttonText,
    errors,
  } = props;

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [key, resetKey] = useKey();
  const formRef = useRef<Form>(null);
  const router = useRouter();

  const handleFormSave = async (data: any, navigateAfterSubmit: boolean) => {
    setIsSaving(true);
    const success = await onSubmit(data);
    resetKey();

    if (success) {
      if (navigateAfterSubmit) {
        setIsRedirecting(true);
        router.push(continueUrl);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    /** Effect triggers when navigation to another page is finished and this component reloads
     *  Otherwise the spinner stops spinning before the page changes. */
    setIsRedirecting(false);
    setIsSaving(false);
  }, [backUrl, continueUrl]);

  // Essentially a manual call to `submit()` with a context
  const onSaveAndContinue = async () => {
    if (formRef.current?.validateForm())
      await handleFormSave(formRef.current.state, true);
  };

  return (
    <FormBase
      {...props}
      key={key}
      formRef={formRef}
      onSubmit={(data) => handleFormSave(data, false)}
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
