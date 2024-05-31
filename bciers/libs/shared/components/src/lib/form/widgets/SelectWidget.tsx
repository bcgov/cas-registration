"use client";

import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { WidgetProps } from "@rjsf/utils/lib/types";
import { DARK_GREY_BG_COLOR, BC_GOV_SEMANTICS_RED } from "@/app/styles/colors";

const SelectWidget: React.FC<WidgetProps> = (props) => {
  const {
    disabled,
    id,
    onBlur,
    onChange,
    onFocus,
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

  const handleChange = (e: SelectChangeEvent) => {
    const val = e.target.value;
    onChange(val || "");
  };

  const handleBlur = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onBlur(id, value);

  const handleFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

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
    <FormControl
      sx={{
        width: "100%",
      }}
    >
      <InputLabel shrink={false}>{!value && placeholder}</InputLabel>
      <Select
        labelId={id}
        id={`${id}_select`}
        value={value || ""}
        disabled={disabled || readonly}
        name={id}
        onBlur={handleBlur}
        onChange={handleChange}
        onFocus={handleFocus}
        sx={styles}
        inputProps={{
          id: id,
          "aria-label": id,
        }}
      >
        {placeholder && (
          <MenuItem disabled value="">
            <em>{`${placeholder} ...`}</em>
          </MenuItem>
        )}
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
export default SelectWidget;
