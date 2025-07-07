import defaultTheme from "./theme/defaultTheme";
import readOnlyTheme from "./theme/readOnlyTheme";
import { useMemo, useState } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, IChangeEvent, withTheme, ThemeProps } from "@rjsf/core";
import customTransformErrors from "@bciers/utils/src/customTransformErrors";
import { RJSFValidationError } from "@rjsf/utils";

// Best I can do for manual text validation for the DateWidget
const currentYear = new Date().getFullYear();
const yearRegEx = new RegExp(`.*(?:${currentYear - 1}|${currentYear}).*`);

const customFormats = {
  phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  "postal-code":
    /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
  bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
  date_format: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]).*/,
  starting_date_year: yearRegEx,
  signature: /^[A-Za-z\s]+$/,
  cra_business_number: /^\d{9}$/,
};
export const customFormatsErrorMessages = {
  bc_corporate_registry_number:
    "BC Corporate Registry number should be 1-3 letters followed by 7 digits",
  "postal-code": "Postal code format is A1A 1A1",
  phone: "Format should be ### ### ####",
  email: "Please enter a valid email address, e.g. mail@example.com",
  uri: "Please enter a valid website link, e.g. http://www.website.com, https://www.website.com",
  date_format: "Starting Date format should be YYYY-MM-DD",
  starting_date_year: `Starting Date must be between ${
    currentYear - 1
  } and ${currentYear}`,
  signature: "Signature should not include special characters or numbers",
  cra_business_number: "CRA Business Number should be 9 digits",
};

const transformErrors = (errors: RJSFValidationError[]) => {
  return customTransformErrors(errors, customFormatsErrorMessages);
};

const validator = customizeValidator({ customFormats });

export interface FormPropsWithTheme<T> extends Omit<FormProps<T>, "validator"> {
  theme?: ThemeProps;
  validator?: any;
  formRef?: any;
  setErrorReset?: (error: undefined) => void;
}

// formbase with forwardRef

const FormBase: React.FC<FormPropsWithTheme<any>> = (props) => {
  const {
    disabled,
    formData,
    omitExtraData,
    formRef,
    onChange,
    onSubmit,
    readonly,
    setErrorReset,
    theme,
  } = props;
  const formTheme = disabled || readonly ? readOnlyTheme : defaultTheme;
  const Form = useMemo(() => withTheme(theme ?? formTheme), [theme, formTheme]);
  const [formState, setFormState] = useState(formData ?? {});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handling form state externally as RJSF was resetting the form data on submission and
  // creating buggy behaviour if there was an API error and the user attempted to resubmit
  const handleSubmit = (e: IChangeEvent) => {
    setIsSubmitting(true);
    setFormState(e.formData);
    if (setErrorReset) setErrorReset(undefined); // Reset error state on form submission
    if (onSubmit) onSubmit(e, formState);
  };

  const handleChange = (e: IChangeEvent) => {
    setIsSubmitting(false);
    // If onChange is provided control the form state externally to stop form data loss
    // on re-render when setting state in the parent component
    // ⚠️ Warning ⚠️ - be mindful of the performance implications of both controlled state as well as
    // running expensive computations in the OnChange callback, especially with complex forms
    if (onChange) {
      onChange(e); // Pass the event back to the parent component
    }
  };
  return (
    <Form
      {...props}
      ref={formRef}
      formData={isSubmitting ? formState : formData}
      onChange={handleChange}
      noHtml5Validate
      omitExtraData={omitExtraData ?? true}
      onSubmit={handleSubmit}
      showErrorList={false}
      transformErrors={transformErrors}
      validator={validator}
    />
  );
};

export default FormBase;
