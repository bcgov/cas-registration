import defaultTheme from "@bciers/components/form/theme/defaultTheme";
import readOnlyTheme from "@bciers/components/form/theme/readOnlyTheme";
import { createRef, useEffect, useMemo, useState } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, IChangeEvent, withTheme, ThemeProps } from "@rjsf/core";
import customTransformErrors from "@/app/utils/customTransformErrors";
import { RJSFValidationError } from "@rjsf/utils";
import { uniqWith, isEqual } from "lodash";

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

interface Error {
  message: string;
  name: string;
  params?: { [key: string]: string };
  property: string;
  schemaPath?: string;
  stack: string;
}

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
  const [formSubmitState, setFormSubmitState] = useState(formData ?? {});
  const [focusedField, setFocusedField] = useState<string | undefined>();

  // Handling form state externally as RJSF was resetting the form data on submission and
  // creating buggy behaviour if there was an API error and the user attempted to resubmit
  const handleSubmit = (e: IChangeEvent) => {
    setFormSubmitState(e.formData);
    if (setErrorReset) setErrorReset(undefined); // Reset error state on form submission

    if (onSubmit) onSubmit(e, formSubmitState);
  };

  const formRef = createRef<any>();

  const validateSingleField = (field: string) => {
    // RJSF does not support single field validation out of the box
    // This function is a workaround to validate a single field
    const $this = formRef.current;
    const { formData, errors, errorSchema } = $this.state;

    const { errors: _errors, errorSchema: _errorSchema } =
      $this.validate(formData);

    const prevOtherFieldErrors = errors.filter(
      (error: Error) => error.property !== `.${field}`,
    );

    const fieldErrors = _errors.filter(
      (error: Error) => error.property === `.${field}`,
    );

    const fieldErrorSchema = _errorSchema[field];

    $this.setState({
      errors: uniqWith([...prevOtherFieldErrors, ...fieldErrors], isEqual),
      errorSchema: { ...errorSchema, [field]: fieldErrorSchema },
    });
  };

  const handleChange = (e: IChangeEvent) => {
    // Use schemaUtils validator to validate form data but not trigger validation
    const validator = e.schemaUtils.getValidator();
    const isValid =
      validator.validateFormData(e.formData, props.schema).errors.length === 0;
    onChange?.(e);
    // If onLiveValidation is provided, call it with the current form validation status
    onLiveValidation?.(isValid);

    // Validate the focused field on change
    validateSingleField(focusedField ?? "");
  };

  const handleFocus = (field: string) => {
    // We can't get the field id onChange so saving the current field state on focus
    // to validate onChange
    const fieldName = field.slice("root_".length);
    setFocusedField(fieldName);
  };

  useEffect(() => {
    // TODO: Likely remove this as it's a hacky workaround when using multiple forms on the same page
    // which I will try to avoid for the single step task list
    // Trigger validation prop to externally trigger form validation
    if (triggerValidation) {
      formRef.current?.validateForm();
    }
  }, [triggerValidation]);

  const handleBlur = (...args: string[]) => {
    const field = args[0].slice("root_".length);
    validateSingleField(field);
  };

  return (
    <Form
      {...props}
      ref={formRef}
      formData={formSubmitState}
      noHtml5Validate
      omitExtraData={omitExtraData ?? true}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onChange={handleChange}
      onSubmit={handleSubmit}
      showErrorList={false}
      transformErrors={transformErrors}
      validator={validator}
      children={children}
    />
  );
};

export default FormBase;
