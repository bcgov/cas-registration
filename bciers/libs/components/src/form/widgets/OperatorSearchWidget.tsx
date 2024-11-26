"use client";

import { SyntheticEvent, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import debounce from "lodash.debounce";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

const OperatorSearchWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  value,
  readonly,
  uiSchema,
}) => {
  const [options, setOptions] = useState([] as string[]);
  const [isSearchAttempted, setIsSearchAttempted] = useState(false);

  const handleChange = (
    e: SyntheticEvent<Element, Event>,
    option: string | null,
  ) => {
    onChange(option);
    setOptions([]);
    setIsSearchAttempted(false);
  };

  const changeHandler = async (_event: React.ChangeEvent<{}>, val: string) => {
    if (!val) {
      setIsSearchAttempted(false);
      setOptions([]);
      return;
    }

    const response = await actionHandler(
      `registration/v2/operators?legal_name=${val}`,
      "GET",
    );

    if (!response || response?.error) {
      return;
    }

    const results = response.map(
      (item: { legal_name: any }) => item.legal_name,
    );

    setOptions(results);
    setIsSearchAttempted(true);
  };

  // 200ms debounce to prevent excessive API calls
  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 200),
    [],
  );

  // Clear options when the field loses focus as the dropdown will remain open otherwise
  const handleBlur = () => {
    setOptions([]);
    setIsSearchAttempted(false);
  };

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
    "& .MuiAutocomplete-noOptions": {
      color: "red!important",
    },
  };

  return (
    <Autocomplete
      disablePortal
      id={id}
      forcePopupIcon={false}
      disabled={disabled || readonly}
      autoHighlight
      options={options}
      sx={styles}
      noOptionsText="No results found. Retry or create an operator."
      open={
        // open the dropdown if there are options and no value
        // or if the user has attempted a search so we can show the "no results" message
        (options.length > 0 && !options.includes(value as string)) ||
        (options.length === 0 && isSearchAttempted)
      }
      onChange={handleChange}
      onBlur={handleBlur}
      onInputChange={debouncedChangeHandler}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={uiSchema?.["ui:placeholder"] ?? ""}
        />
      )}
      renderOption={(renderProps, option: any) => (
        <li
          {...renderProps}
          key={option}
          // We need to use MuiAutocomplete-option to keep the default styles
          className="MuiAutocomplete-option text-left"
        >
          {option}
        </li>
      )}
    />
  );
};
export default OperatorSearchWidget;
