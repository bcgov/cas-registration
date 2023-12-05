"use client";

import { Autocomplete, Chip, MenuItem, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

interface Option {
  id: string | number;
  label: string | number;
}

const MultiSelectWidget: React.FC<WidgetProps> = ({
  id,
  onChange,
  rawErrors,
  schema,
  value,
  uiSchema,
}) => {
  const fieldSchema = schema.items as {
    enum: Array<string | number>;
    enumNames?: Array<string | number>;
    type: string;
  };

  // Using enum and enumNames as anyOf was triggering a lot of validation errors for multiselect
  // If no enumNames are provided, use the enum values as the names. The enumNames will not be saved in the formData.
  const enumValues = fieldSchema?.enum;
  const enumNames = fieldSchema?.enumNames;
  const options = enumValues.map((val: string | number, index: number) => ({
    id: val,
    label: enumNames?.[index] || val,
  }));

  const handleChange = (e: React.ChangeEvent<{}>, option: Array<Option>) => {
    onChange(option.map((o: Option) => o.id));
  };

  const placeholder = uiSchema?.["ui:placeholder"]
    ? `${uiSchema["ui:placeholder"]}...`
    : "";

  const displayPlaceholder = value?.length === 0;

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
      filterSelectedOptions
      autoHighlight
      options={options}
      value={value.map((val: string | number) => {
        return options.find((option: Option) => option.id === val);
      })}
      sx={styles}
      isOptionEqualToValue={(option: Option, val: Option) => {
        return option.id === val.id;
      }}
      onChange={handleChange}
      getOptionLabel={(option: Option) => String(option.label)}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={displayPlaceholder ? placeholder : ""}
        />
      )}
      renderTags={(val: Array<Option>, getTagProps: any) => {
        return val.map((option: Option, index: number) => {
          return (
            <Chip
              {...getTagProps}
              key={option.id}
              label={option.label}
              {...getTagProps({
                index,
              })}
            />
          );
        });
      }}
      renderOption={(renderProps, option: Option) => {
        return (
          <MenuItem {...renderProps} key={option.id} value={option.id}>
            {option.label}
          </MenuItem>
        );
      }}
    />
  );
};

export default MultiSelectWidget;
