import defaultTheme from "@bciers/components/form/theme/defaultTheme";
import readOnlyTheme from "@bciers/components/form/theme/readOnlyTheme";
import { createRef, useEffect, useMemo, useState } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, IChangeEvent, withTheme, ThemeProps } from "@rjsf/core";
import customTransformErrors from "@/app/utils/customTransformErrors";
import { RJSFValidationError } from "@rjsf/utils";
import { get, omit, cloneDeep, set, unset } from "lodash";

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
  children?: React.ReactNode | true;
  onChange?: (e: IChangeEvent) => void;
  onLiveValidation?: (isValid: boolean) => void;
  theme?: ThemeProps;
  validator?: any;
  setErrorReset?: (error: undefined) => void;
  triggerValidation?: boolean;
}

const FormBase: React.FC<FormPropsWithTheme<any>> = (props) => {
  const {
    children,
    disabled,
    formData,
    omitExtraData,
    onChange,
    onSubmit,
    onLiveValidation,
    readonly,
    setErrorReset,
    theme,
    triggerValidation,
  } = props;
  const formTheme = disabled || readonly ? readOnlyTheme : defaultTheme;
  const Form = useMemo(() => withTheme(theme ?? formTheme), [theme, formTheme]);
  const [formState, setFormState] = useState(formData ?? {});
  const [errors, setErrors] = useState({});

  // Handling form state externally as RJSF was resetting the form data on submission and
  // creating buggy behaviour if there was an API error and the user attempted to resubmit
  const handleSubmit = (e: IChangeEvent) => {
    setFormState(e.formData);
    if (setErrorReset) setErrorReset(undefined); // Reset error state on form submission

    if (onSubmit) onSubmit(e, formState);
  };

  const formRef = createRef<any>();

  const handleChange = (e: IChangeEvent) => {
    const validator = e.schemaUtils.getValidator();
    const isValid =
      validator.validateFormData(e.formData, props.schema).errors.length === 0;
    onChange?.(e);
    // If onLiveValidation is provided, call it with the current form validation status
    onLiveValidation?.(isValid);
  };

  useEffect(() => {
    // Trigger validation prop to externally trigger form validation
    if (triggerValidation) {
      formRef.current?.validateForm();
    }
  }, [triggerValidation]);

  // const handleBlur = (...args: string[]) => {
  //   // TODO: should this be conditionally enabled or okay to always run?
  //   // RJSF does not support single field validation out of the box
  //   // This workaround is based on the following example:
  //   // https://github.com/rjsf-team/react-jsonschema-form/issues/617#issuecomment-1003141946
  //   const $this = formRef.current;
  //
  //   const fieldPath = args[0].split("root_").slice(1);
  //   const { formData, errorSchema: stateErrorSchema } = $this.state;
  //   const fieldValue = get(formData, fieldPath);
  //   // clear empty string values since JSON schema considers "" sufficient to pass `required` validation
  //   let formDataToValidate =
  //     fieldValue === "" ? omit(formData, fieldPath) : formData;
  //
  //   const { errorSchema: validatedErrorSchema } =
  //     $this.validate(formDataToValidate);
  //   const newErrorSchema = cloneDeep(stateErrorSchema);
  //   const newFieldErrorSchema = get(validatedErrorSchema, fieldPath);
  //
  //   if (newFieldErrorSchema) {
  //     set(newErrorSchema, fieldPath, newFieldErrorSchema);
  //   } else {
  //     // if there is no errorSchema for the field that was blurred, delete the key
  //     unset(newErrorSchema, fieldPath);
  //   }
  //   setErrors(newErrorSchema);
  // };

  return (
    <Form
      {...props}
      ref={formRef}
      formData={formState}
      noHtml5Validate
      omitExtraData={omitExtraData ?? true}
      // onBlur={handleBlur}
      onChange={handleChange}
      onSubmit={handleSubmit}
      showErrorList={false}
      extraErrors={errors}
      transformErrors={transformErrors}
      validator={validator}
      children={children}
    />
  );
};

export default FormBase;
