"use client";

import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

const TextWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  value,
}) => {
  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
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
    />
  );
};
export default TextWidget;
