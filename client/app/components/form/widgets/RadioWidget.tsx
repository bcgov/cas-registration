import { FocusEvent } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import {
  enumOptionsIndexForValue,
  enumOptionsValueForIndex,
  optionId,
  WidgetProps,
} from "@rjsf/utils";

const RadioWidget = ({
  id,
  options,
  value: val,
  disabled,
  readonly,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) => {
  const { enumOptions, enumDisabled, emptyValue } = options;

  const onChangeHandler = (_: any, value: any) =>
    onChange(enumOptionsValueForIndex(value, enumOptions, emptyValue));
  const onBlurHandler = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, enumOptionsValueForIndex(value, enumOptions, emptyValue));
  const onFocusHandler = ({
    target: { value },
  }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, enumOptionsValueForIndex(value, enumOptions, emptyValue));

  const row = options ? options.inline : false;
  const selectedIndex = enumOptionsIndexForValue(val, enumOptions) ?? null;

  return (
    <RadioGroup
      id={id}
      name={id}
      value={selectedIndex}
      sx={{
        flexDirection: "row",
      }}
      row={row as boolean}
      onChange={onChangeHandler}
      onBlur={onBlurHandler}
      onFocus={onFocusHandler}
    >
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index) => {
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          const radio = (
            <FormControlLabel
              control={
                <Radio name={id} id={optionId(id, index)} color="primary" />
              }
              label={option.label}
              value={String(index)}
              key={index}
              disabled={disabled || itemDisabled || readonly}
            />
          );

          return radio;
        })}
    </RadioGroup>
  );
};

export default RadioWidget;
