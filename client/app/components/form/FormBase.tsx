import defaultTheme from "./defaultTheme";
import { useMemo } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, withTheme, ThemeProps } from "@rjsf/core";
import { customTransformErrors } from "@/app/utils/customTransformErrors";
import { RJSFValidationError } from "@rjsf/utils";

const customFormats = {
  phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  "postal-code":
    /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
  bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
};

const customFormatsErrorMessages = {
  bc_corporate_registry_number:
    "BC Corporate Registry number should be 1-3 letters followed by 7 digits",
  "postal-code": "Format should be A1A 1A1",
  phone: "Format should be ###-###-####",
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
}

const FormBase: React.FC<FormPropsWithTheme<any>> = (props) => {
  const { theme, formData, omitExtraData } = props;
  const Form = useMemo(() => withTheme(theme ?? defaultTheme), [theme]);

  return (
    <Form
      {...props}
      formData={formData ?? {}}
      noHtml5Validate
      omitExtraData={omitExtraData ?? true}
      showErrorList={false}
      transformErrors={transformErrors}
      validator={validator}
    />
  );
};

export default FormBase;
