"use client";

import { TextField, Autocomplete, MenuItem } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

const ComboBox: React.FC<WidgetProps> = ({
  id,
  onChange,
  rawErrors,
  schema,
  value,
  uiSchema,
}) => {
  const fieldSchema = schema.items as {
    enum: any[];
    enumNames: any[];
    type: string;
  };
  const enumValues = fieldSchema?.enum as any;
  const enumNames = fieldSchema?.enumNames as any;
  const options = enumValues.map((val, index) => ({
    const: val,
    title: enumNames[index] || val,
  }));

  const handleChange = (
    e: React.ChangeEvent<{}>,
    option: Array<{ const: string | number; title: string }>,
  ) => {
    onChange(option.map((o) => o.const));
  };

  const placeholder = uiSchema?.["ui:placeholder"]
    ? `${uiSchema["ui:placeholder"]}...`
    : "";

  const displayPlaceholder =
    typeof value === "undefined" || value?.length === 0;

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor,
    },
  };

  return (
    <Autocomplete
      disablePortal
      id={id}
      multiple
      autoHighlight
      options={options}
      sx={styles}
      isOptionEqualToValue={(option: any, val: any) => option.const === val}
      onChange={handleChange}
      getOptionLabel={(option: any) => String(option.title)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={displayPlaceholder ? placeholder : ""}
        />
      )}
      renderOption={(renderProps, option: any) => {
        return (
          <MenuItem {...renderProps} key={option.const} value={option.const}>
            {option.title}
          </MenuItem>
        );
      }}
    />
  );
};
export default ComboBox;
