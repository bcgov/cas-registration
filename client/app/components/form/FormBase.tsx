import defaultTheme from "./defaultTheme";
import { useMemo } from "react";
import validator from "@rjsf/validator-ajv8";
import { FormProps, withTheme, ThemeProps } from "@rjsf/core";

interface FormPropsWithTheme<T> extends Omit<FormProps<T>, "validator"> {
  theme?: ThemeProps;
  validator?: any;
}

const FormBase: React.FC<FormPropsWithTheme<any>> = (props) => {
  const { theme, formData, omitExtraData } = props;
  const Form = useMemo(() => withTheme(theme ?? defaultTheme), [theme]);

  return (
    <Form
      formData={formData ?? {}}
      noHtml5Validate
      omitExtraData={omitExtraData ?? true}
      showErrorList={false}
      validator={validator}
      {...props}
    />
  );
};

export default FormBase;
