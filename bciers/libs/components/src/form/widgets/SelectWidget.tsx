"use client";

import { Autocomplete, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const options = schema.enum as Array<string>;

  const handleChange = (e: React.ChangeEvent<{}>, option: string | null) => {
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
      getOptionLabel={(option: string) => option}
      renderInput={(params) => (
        <TextField
          {...params}
          data-testid={id}
          placeholder={placeholder ?? ""}
        />
      )}
      renderOption={(renderProps, option: string) => {
        return (
          <li {...renderProps} key={option}>
            {option}
          </li>
        );
      }}
    />
  );
};
export default SelectWidget;
