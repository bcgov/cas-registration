"use client";

import { Autocomplete, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";
import React from "react";

const SelectWidget: React.FC<WidgetProps> = (props) => {
  const {
    disabled,
    id,
    onChange,
    rawErrors,
    readonly,
    schema,
    uiSchema,
    value,
  } = props;
  const placeholder = uiSchema?.["ui:placeholder"];
  const options = schema.enum as Array<string>;
  const enumNames = (uiSchema?.["ui:enumNames"] as Array<string>) || [];

  const getOptionLabel = (option: string) => {
    const optionIndex = options.indexOf(option);
    return enumNames[optionIndex] ?? option;
  };

  const handleChange = (e: React.SyntheticEvent, option: string | null) => {
    onChange(option || "");
  };

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
      disabled={disabled || readonly}
      autoHighlight
      options={options || []}
      value={value || null}
      sx={styles}
      onChange={handleChange}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => (
        <TextField {...params} data-testid={id} placeholder={placeholder} />
      )}
      renderOption={(renderProps, option: string) => {
        return (
          <li {...renderProps} key={option}>
            {getOptionLabel(option)}
          </li>
        );
      }}
    />
  );
};
export default SelectWidget;
