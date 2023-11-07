"use client";

import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";

const TextWidget: React.FC<WidgetProps> = (props) => {
  const { id, onChange, value } = props;

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  return (
    <TextField
      id={id}
      value={value}
      onChange={handleChange}
      sx={{
        width: "100%",
      }}
    />
  );
};
export default TextWidget;
