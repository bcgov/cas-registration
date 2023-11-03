"use client";

import MenuItem from "@mui/material/MenuItem";
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
    onChange(val === "" ? undefined : val);
  };
  return (
    <Select id={id} value={value} onChange={handleChange}>
      {placeholder && (
        <MenuItem disabled value="">
          {`${placeholder} ...`}
        </MenuItem>
      )}
      {options?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
};
export default SelectWidget;
