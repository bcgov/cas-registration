"use client";

import { useEffect } from "react";
import { Autocomplete, Chip, MenuItem, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

interface Option {
  id: string | number;
  label: string | number;
}

export interface FieldSchema {
  enum: Array<string | number>;
  enumNames?: Array<string | number>;
  type: string;
}

export const mapOptions = (fieldSchema: FieldSchema) => {
  // Using enum and enumNames as anyOf was triggering a lot of validation errors for multiselect
  const enumValues = fieldSchema?.enum;
  if (enumValues) {
    const enumNames = fieldSchema?.enumNames;
    // If no enumNames are provided, use the enum values as the names. The enumNames will not be saved in the formData.
    return enumValues.map((enumValue: string | number, index: number) => ({
      id: enumValue,
      label: enumNames?.[index] ?? enumValue,
    }));
  } else {
    return [];
  }
};

const MultiSelectWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  schema,
  value,
  uiSchema,
}) => {
  const isValue = value && value.length !== 0 && value?.[0] !== undefined;
  const fieldSchema = schema.items as FieldSchema;

  const options = mapOptions(fieldSchema);

  const handleChange = (e: React.ChangeEvent<{}>, option: Array<Option>) => {
    onChange(option.map((o: Option) => o.id));
  };

  useEffect(() => {
    if (!isValue) {
      onChange([]);
    }
  }, []);

  const placeholder = uiSchema?.["ui:placeholder"]
    ? `${uiSchema["ui:placeholder"]}...`
    : "";

  const displayPlaceholder = !isValue;

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor,
    },
  };

  const chipStyle = {
    height: "auto",
    maxWidth: "150px",
    "& .MuiChip-label": {
      whiteSpace: "normal", // Allows text wrapping
      wordBreak: "break-word", // Breaks long words if needed
      overflowWrap: "break-word", // Ensures proper word breaks
      display: "block", // Forces multiline wrapping
      padding: ".5rem", // Spaces to match the design document
    },
  };

  const menuItemStyle = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
  };

  return (
    <Autocomplete
      id={id}
      disabled={disabled || readonly}
      disablePortal
      multiple
      filterSelectedOptions
      autoHighlight
      options={options}
      value={
        isValue
          ? value.map((val: string | number) => {
              return options.find((option: Option) => option.id === val);
            })
          : []
      }
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
      renderTags={(renderOptions: Array<Option>, getTagProps: any) => {
        return renderOptions.map((option: Option, index: number) => {
          return (
            <Chip
              {...getTagProps}
              key={option.id}
              label={option.label}
              {...getTagProps({
                index,
              })}
              sx={chipStyle}
            />
          );
        });
      }}
      renderOption={(renderProps, option: Option) => {
        return (
          <MenuItem
            {...renderProps}
            key={option.id}
            value={option.id}
            sx={menuItemStyle}
          >
            {option.label}
          </MenuItem>
        );
      }}
    />
  );
};

export default MultiSelectWidget;
