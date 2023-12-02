import defaultTheme from "./defaultTheme";
import { useMemo } from "react";
import { customizeValidator } from "@rjsf/validator-ajv8";
import { FormProps, withTheme, ThemeProps } from "@rjsf/core";

const customFormats = {
  phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
  "postal-code":
    /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
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
      validator={validator}
    />
  );
};

export default FormBase;
