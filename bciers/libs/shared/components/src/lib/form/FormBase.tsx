import defaultTheme from "./theme/defaultTheme";
import readOnlyTheme from "./theme/readOnlyTheme";
import { useMemo, useState } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, IChangeEvent, withTheme, ThemeProps } from "@rjsf/core";
import customTransformErrors from "@/app/utils/customTransformErrors";
import { RJSFValidationError } from "@rjsf/utils";

const customFormats = {
  phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  "postal-code":
    /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
  bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
};

export const customFormatsErrorMessages = {
  bc_corporate_registry_number:
    "BC Corporate Registry number should be 1-3 letters followed by 7 digits",
  cra_business_number: "CRA Business Number should be 9 digits.",
  statutory_declaration: "Attachment is mandatory.",
  "postal-code": "Format should be A1A 1A1",
  phone: "Format should be ### ### ####",
  email: "Please enter a valid email address, e.g. mail@example.com",
  uri: "Please enter a valid website link, e.g. http://www.website.com, https://www.website.com",
};

const transformErrors = (errors: RJSFValidationError[]) => {
  return customTransformErrors(errors, customFormatsErrorMessages);
};

const validator = customizeValidator({ customFormats });

interface FormPropsWithTheme<T> extends Omit<FormProps<T>, "validator"> {
  theme?: ThemeProps;
  validator?: any;
  setErrorReset?: (error: undefined) => void;
}

const FormBase: React.FC<FormPropsWithTheme<any>> = (props) => {
  const {
    disabled,
    formData,
    omitExtraData,
    onChange,
    onSubmit,
    readonly,
    setErrorReset,
    theme,
  } = props;
  const formTheme = disabled || readonly ? readOnlyTheme : defaultTheme;
  const Form = useMemo(() => withTheme(theme ?? formTheme), [theme, formTheme]);
  const [formState, setFormState] = useState(formData ?? {});

  // Handling form state externally as RJSF was resetting the form data on submission and
  // creating buggy behaviour if there was an API error and the user attempted to resubmit
  const handleSubmit = (e: IChangeEvent) => {
    setFormState(e.formData);
    if (setErrorReset) setErrorReset(undefined); // Reset error state on form submission

    if (onSubmit) onSubmit(e, formState);
  };

  const handleChange = (e: IChangeEvent) => {
    // If onChange is provided control the form state externally to stop form data loss
    // on re-render when setting state in the parent component
    // ⚠️ Warning ⚠️ - be mindful of the performance implications of both controlled state as well as
    // running expensive computations in the OnChange callback, especially with complex forms
    if (onChange) {
      setFormState(e.formData);
      onChange(e); // Pass the event back to the parent component
    }
  };

  return (
    <Form
      {...props}
      formData={formState}
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
