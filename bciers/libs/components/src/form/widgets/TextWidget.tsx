"use client";

import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

const TextWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  schema,
  uiSchema,
  placeholder,
  value,
}) => {
  const type = schema.type === "number" ? "number" : "text";
  const max =
    uiSchema?.["ui:options"]?.max && Number(uiSchema?.["ui:options"]?.max);
  const maxNumDbLimit = 2147483647;

  const maxNum = max || maxNumDbLimit;

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    if (type === "number" && !isNaN(Number(val)) && Number(val) > maxNum)
      return;

    onChange(val === "" ? undefined : val);
  };

  // handleKeyDown and handlePaste are just for the number field's 'e
  const handleKeyDown = (e: any) => {
    // Necessary to check for 'e' since it does not appear in handleChange event
    if (e.keyCode === 69) {
      e.preventDefault();
    }
  };
  const handlePaste = (e: any) => {
    // Check to allow only optional -, .digit or digit.digit
    const regExp = /^-?(\d+(\.\d*)?|\.\d+)$/g;
    if (!regExp.test(e.clipboardData.getData("text"))) {
      // Paste data is no good
      e.preventDefault();
    }
  };

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor,
      },
    },
  };

  return (
    <TextField
      id={id}
      disabled={disabled || readonly}
      name={id}
      value={value}
      onChange={handleChange}
      sx={styles}
      type={type}
      placeholder={placeholder}
      onKeyDown={type === "number" ? handleKeyDown : undefined}
      onPaste={type === "number" ? handlePaste : undefined}
    />
  );
};
export default TextWidget;
