"use client";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { WidgetProps } from "@rjsf/utils/lib/types";

const SelectWidget: React.FC<WidgetProps> = (props) => {
  const { id, onChange, schema, uiSchema, value } = props;
  const placeholder = uiSchema?.["ui:placeholder"];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const options = schema.enum as Array<string>;

  const handleChange = (e: SelectChangeEvent) => {
    const val = e.target.value;
    onChange(val || "");
  };

  return (
    <FormControl
      sx={{
        width: "100%",
      }}
    >
      <InputLabel id={id} shrink={false}>
        {!value && placeholder}
      </InputLabel>
      <Select
        labelId={id}
        value={value || ""}
        onChange={handleChange}
        sx={{
          width: "100%",
          "& .MuiSelect-outlined": {
            borderColor: "rgba(0, 0, 0, 0.23)",
          },
        }}
      >
        {placeholder && (
          <MenuItem disabled value="">
            <em>{`${placeholder} ...`}</em>
          </MenuItem>
        )}
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default SelectWidget;
