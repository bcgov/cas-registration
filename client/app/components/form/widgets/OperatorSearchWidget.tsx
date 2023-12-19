"use client";

import { SyntheticEvent, useMemo, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { actionHandler } from "@/app/utils/actions";
import debounce from "lodash.debounce";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

const OperatorSearchWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  value,
  uiSchema,
}) => {
  const [options, setOptions] = useState([] as string[]);

  const handleChange = (
    e: SyntheticEvent<Element, Event>,
    option: string | null,
  ) => {
    onChange(option);
    setOptions([]);
  };

  const changeHandler = async (_event: React.ChangeEvent<{}>, val: string) => {
    const queryParam = `?legal_name=${val}`;
    const response = await actionHandler(
      `registration/operators/legal-name${queryParam}`,
      "GET",
    );

    if (response.error) {
      return;
    }

    const results = response.map(
      (item: { legal_name: any }) => item.legal_name,
    );
    setOptions(results);
  };

  const debouncedChangeHandler = useMemo(
    () => debounce(changeHandler, 200),
    [],
  );

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
      forcePopupIcon={false}
      disabled={disabled || readonly}
      autoHighlight
      options={options}
      sx={styles}
      open={options.length > 0 && !options.includes(value as string)}
      onChange={handleChange}
      onInputChange={debouncedChangeHandler}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={uiSchema?.["ui:placeholder"] ?? ""}
        />
      )}
      // 👻 define how to render each option to bypass key warning
      renderOption={(renderProps, option: any) => {
        return (
          <li {...renderProps} key={option}>
            {option}
          </li>
        );
      }}
    />
  );
};
export default OperatorSearchWidget;
