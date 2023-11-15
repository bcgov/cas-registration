"use client";

import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";

const TextWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  readonly,
  value,
}) => {
  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  return (
    <TextField
      id={id}
      disabled={disabled || readonly}
      name={id}
      value={value}
      onChange={handleChange}
      sx={{
        width: "100%",
      }}
    />
  );
};
export default TextWidget;
