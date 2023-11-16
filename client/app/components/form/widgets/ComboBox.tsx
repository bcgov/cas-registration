"use client";

import { Autocomplete, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { useCallback } from "react";

const ComboBox: React.FC<WidgetProps> = (props) => {
  const { id, onChange, schema, value, label } = props;

  const handleChange = (e: React.ChangeEvent<{}>, option: any) => {
    onChange(option?.enum?.[0]);
  };
  console.log("value", value, schema);

  const getSelected = useCallback(() => {
    if (!value || !schema?.anyOf) return null;
    const selectedValue = schema.anyOf.find(
      (option) => (option as any).enum?.[0] === value,
    );
    return selectedValue;
  }, [schema, value]);

  const options = schema?.anyOf ?? [];

  return (
    <Autocomplete
      disablePortal
      id={id}
      autoHighlight
      options={options}
      defaultValue={getSelected()}
      value={getSelected()}
      onChange={handleChange}
      getOptionLabel={(option: any) => (option ? option.title : "")}
      renderInput={(params) => <TextField {...params} label={label} />}
      // 👻 define how to render each option to bypass key warning
      renderOption={(renderProps, option: any) => {
        return (
          <li {...renderProps} key={option.value}>
            {option.title}
          </li>
        );
      }}
    />
  );
};
export default ComboBox;
