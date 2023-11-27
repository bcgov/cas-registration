"use client";

import { Autocomplete, TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { useCallback } from "react";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

const ComboBox: React.FC<WidgetProps> = (props) => {
  const { id, onChange, rawErrors, schema, value, uiSchema } = props;

  const handleChange = (e: React.ChangeEvent<{}>, option: any) => {
    onChange(option?.const || option?.value);
  };

  const getSelected = useCallback(() => {
    if (!value || !schema?.anyOf) return null;
    const selectedValue = schema.anyOf.find(
      (option) =>
        (option as any).const === value || (option as any).value === value,
    );

    return selectedValue;
  }, [schema, value]);

  const options = schema?.anyOf ?? [];

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiSelect-outlined": {
      borderColor: DARK_GREY_BG_COLOR,
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: borderColor,
    },
  };

  return (
    <Autocomplete
      disablePortal
      id={id}
      autoHighlight
      options={options}
      defaultValue={getSelected()}
      value={getSelected()}
      sx={styles}
      onChange={handleChange}
      getOptionLabel={(option: any) => (option ? option.title : "")}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={uiSchema?.["ui:placeholder"] ?? ""}
        />
      )}
      // 👻 define how to render each option to bypass key warning
      renderOption={(renderProps, option: any) => {
        return (
          <li {...renderProps} key={option.title}>
            {option.title}
          </li>
        );
      }}
    />
  );
};
export default ComboBox;
