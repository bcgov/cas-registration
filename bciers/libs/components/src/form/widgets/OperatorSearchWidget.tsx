"use client";

import { useCallback, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import { Autocomplete, TextField } from "@mui/material";
import debounce from "lodash.debounce";
import { safeClientRequest } from "@bciers/actions/safeClientRequest";
import type { WidgetProps } from "@rjsf/utils";
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
  formContext,
}) => {
  const [options, setOptions] = useState<string[]>([]);
  const [isSearchAttempted, setIsSearchAttempted] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSelect = (_e: SyntheticEvent, option: string | null) => {
    onChange(option);
    setOptions([]);
    setIsSearchAttempted(false);
    setSearchError(null);
  };

  // Fetch suggestions (called by debounced wrapper below)
  const fetchOperators = useCallback(
    async (val: string) => {
      if (!val) {
        setIsSearchAttempted(false);
        setOptions([]);
        setSearchError(null);
        return;
      }

      setSearchError(null);

      const endpoint = formContext?.endpoint ?? "registration/operators/search";
      const url = `${endpoint}?legal_name=${encodeURIComponent(val)}`;

      const { data, error } = await safeClientRequest<
        Array<{ legal_name: string }>
      >(url, "GET");

      if (error || !data) {
        setSearchError(error || "An unexpected error occurred.");
        setOptions([]);
        setIsSearchAttempted(true);
        return;
      }

      const results = data.map((item) => item.legal_name);

      setOptions(results);
      setIsSearchAttempted(true);
    },
    [formContext],
  );

  // Create ONE debounced function and pass it to MUI directly
  const debouncedOnInputChange = useMemo(
    () =>
      debounce((_event: SyntheticEvent, val: string) => {
        fetchOperators(val);
      }, 200),
    [fetchOperators],
  );

  const handleBlur = () => {
    setOptions([]);
    setIsSearchAttempted(false);
  };

  const isError = !!(rawErrors && rawErrors.length > 0) || !!searchError;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiSelect-outlined": { borderColor: DARK_GREY_BG_COLOR },
    "& .MuiOutlinedInput-notchedOutline": { borderColor },
    "& .MuiAutocomplete-noOptions": { color: "red!important" },
  } as const;

  return (
    <Autocomplete
      disablePortal
      id={id}
      forcePopupIcon={false}
      disabled={disabled || readonly}
      autoHighlight
      options={options}
      sx={styles}
      noOptionsText={
        searchError
          ? `${searchError}`
          : "No results found. Retry or create an operator."
      }
      open={
        (options.length > 0 && !options.includes(value as string)) ||
        (options.length === 0 && isSearchAttempted)
      }
      onChange={handleSelect}
      onBlur={handleBlur}
      onInputChange={debouncedOnInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={uiSchema?.["ui:placeholder"] ?? ""}
        />
      )}
      renderOption={(renderProps, option) => (
        <li
          {...renderProps}
          key={option}
          className="MuiAutocomplete-option text-left"
        >
          {option}
        </li>
      )}
    />
  );
};

export default OperatorSearchWidget;
