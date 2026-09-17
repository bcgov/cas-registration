"use client";

import { useCallback, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import { Autocomplete, TextField } from "@mui/material";
import debounce from "lodash.debounce";
import { actionHandler } from "@bciers/actions";
import type { WidgetProps } from "@rjsf/utils";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";
import {
  useValidationErrors,
  handleApiResponse,
  setClientError,
} from "@bciers/components/validationErrors";

const OperatorSearchWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  value,
  readonly,
  uiSchema,
  registry,
}) => {
  const { formContext } = registry;
  const [options, setOptions] = useState<string[]>([]);
  const [isSearchAttempted, setIsSearchAttempted] = useState(false);
  const { errors, setErrors } = useValidationErrors();

  const handleSelect = (_e: SyntheticEvent, option: string | null) => {
    onChange(option);
    setOptions([]);
    setIsSearchAttempted(false);
  };

  const fetchOperators = useCallback(
    async (val: string) => {
      if (!val) {
        setIsSearchAttempted(false);
        setOptions([]);
        setErrors(undefined);
        return;
      }

      const endpoint = formContext?.endpoint ?? "registration/operators/search";
      const url = `${endpoint}?legal_name=${encodeURIComponent(val)}`;

      try {
        setErrors(undefined);
        const response = await actionHandler(url, "GET");
        const isSuccess = handleApiResponse(response, setErrors);
        if (!isSuccess) {
          setOptions([]);
          setIsSearchAttempted(true);
          return;
        }

        const results = (response as Array<{ legal_name: string }>).map(
          (item) => item.legal_name,
        );

        setOptions(results);
        setIsSearchAttempted(true);
      } catch (error: any) {
        setClientError(error, setErrors);
        setOptions([]);
        setIsSearchAttempted(true);
      }
    },
    [formContext, setErrors],
  );

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

  const errorMessage = errors?.[0]?.error?.message;
  const isError =
    Boolean(errorMessage) || !!(rawErrors && rawErrors.length > 0);
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
        errorMessage || "No results found. Retry or create an operator."
      }
      open={
        Boolean(errorMessage) ||
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
