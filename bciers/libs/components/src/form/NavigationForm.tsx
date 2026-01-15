"use client";

import { useRef, useState } from "react";
import FormBase, { FormPropsWithTheme } from "./FormBase";
import Form from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import ReportingStepButtons from "./components/ReportingStepButtons";
import FormAlerts from "@bciers/components/form/FormAlerts";
import { useRouter } from "next/navigation";
import { Dict } from "@bciers/types/dictionary";
import useKey from "@bciers/utils/src/useKey";

export interface NavigationFormProps
  extends Omit<FormPropsWithTheme<unknown>, "onSubmit"> {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  formData: object;
  baseUrl?: string;
  cancelUrl?: string;
  backUrl?: string;
  continueUrl: string;
  onSubmit?: (data: object, navigateAfterSubmit: boolean) => Promise<boolean>;
  buttonText?: string;
  onChange?: (data: object) => void;
  errors?: (string | React.ReactNode)[];
  saveButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  noSaveButton?: boolean;
  backButtonText?: string;
  formContext?: Dict; // used in RJSF schema for access to form data in custom templates
}

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
    backButtonText,
  } = props;

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [key, resetKey] = useKey();
  const [navTargets, setNavTargets] = useState({
    backUrl: backUrl,
    continueUrl: continueUrl,
  });
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
      // Invalidate next router caching
      router.refresh();
    } else {
      setIsSaving(false);
    }
  };

  if (backUrl != navTargets.backUrl || continueUrl != navTargets.continueUrl) {
    /** Triggered when navigation to another page is finished and this component reloads
     *  Otherwise the spinner stops spinning before the page changes.
     *  Replaces old effect with recommended strategy: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
     * */

    setNavTargets({ backUrl: backUrl, continueUrl: continueUrl });
    setIsRedirecting(false);
    setIsSaving(false);
    // Invalidate next router caching again
    router.refresh();
  }

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
        backButtonText={backButtonText}
      />
      {/* Render form alerts */}
      <FormAlerts key="alerts" errors={errors} />
    </FormBase>
  );
};

export default NavigationForm;
