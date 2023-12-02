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
  // only allow letters and numbers
  const re = /^[a-zA-Z0-9]+$/;

  const handleChange = (e: { target: { value: string } }) => {
    // remove spaces
    const val = e.target.value && e.target.value.split(" ").join("");
    if (!val) return onChange(undefined);
    if (val.length > 6) return;
    if (!re.test(val)) return;

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
      value={
        // format the postal code in uppercase with a space
        value && value.length >= 4
          ? `${value.slice(0, 3)} ${value.slice(3)}`.toUpperCase()
          : value
      }
      onChange={handleChange}
      sx={styles}
      type="text"
    />
  );
};
export default TextWidget;
