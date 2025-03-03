"use client";

import { useEffect, useRef, useState } from "react";
import FormBase, { FormPropsWithTheme } from "./FormBase";
import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import ReportingStepButtons from "./components/ReportingStepButtons";
import FormAlerts from "@bciers/components/form/FormAlerts";
import { useRouter } from "next/navigation";

export interface NavigationFormProps
  extends Omit<FormPropsWithTheme<any>, "onSubmit"> {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  formData: any;
  baseUrl?: string;
  cancelUrl?: string;
  backUrl?: string;
  continueUrl: string;
  onSubmit?: (data: any, navigateAfterSubmit: boolean) => Promise<boolean>;
  buttonText?: string;
  onChange?: (data: any) => void;
  errors?: string[];
  saveButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  noSaveButton?: boolean;
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
    noSaveButton,
  } = props;

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [key, resetKey] = useKey();
  const formRef = useRef<Form>(null);
  const shouldNavigateRef = useRef(false);
  const router = useRouter();

  const handleFormSave = async (data: any, navigateAfterSubmit: boolean) => {
    setIsSaving(true);
    if (!onSubmit) {
      // This path should never be reached - just here so typescript is happy
      throw new Error("form handler was called while onSubmit was not defined");
    }
    const success = await onSubmit(data, navigateAfterSubmit);
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
    if (formRef.current) {
      if (formRef.current.validateForm()) {
        shouldNavigateRef.current = true; // Set the flag to true before submitting
        // Calls Form submit() method, ensuring omitExtraData is enforced since onSubmit function receives the cleaned formData.
        await formRef.current.submit();
      }
    }
  };

  return (
    <FormBase
      {...props}
      key={key}
      formRef={formRef}
      onSubmit={(data) => {
        handleFormSave(data, shouldNavigateRef.current);
        shouldNavigateRef.current = false; // Reset after submission
      }}
    >
      <ReportingStepButtons
        key="form-buttons"
        backUrl={backUrl}
        continueUrl={continueUrl}
        isSaving={isSaving}
        isSuccess={isSuccess}
        isRedirecting={isRedirecting}
        saveButtonDisabled={saveButtonDisabled}
        submitButtonDisabled={submitButtonDisabled}
        saveAndContinue={onSubmit ? onSaveAndContinue : undefined}
        buttonText={buttonText}
        noSaveButton={noSaveButton}
      />
      {/* Render form alerts */}
      <FormAlerts errors={errors} />
    </FormBase>
  );
};

export default NavigationForm;
