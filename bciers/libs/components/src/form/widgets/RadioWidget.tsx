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
  uiSchema,
}: WidgetProps) => {
  const { enumOptions, enumDisabled, emptyValue } = options;

  const onChangeHandler = (_: any, value: any) => {
    if (readonly) return;
    onChange(enumOptionsValueForIndex(value, enumOptions, emptyValue));
  };
  const onBlurHandler = ({ target: { value } }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, enumOptionsValueForIndex(value, enumOptions, emptyValue));
  const onFocusHandler = ({
    target: { value },
  }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, enumOptionsValueForIndex(value, enumOptions, emptyValue));

  const row = uiSchema?.["ui:options"]?.inline;
  const selectedIndex = enumOptionsIndexForValue(val, enumOptions) ?? null;

  return (
    <RadioGroup
      id={id}
      name={id}
      value={selectedIndex}
      row={row ?? true} // default to row layout since that's the most common case for our app
      onChange={onChangeHandler}
      onBlur={onBlurHandler}
      onFocus={onFocusHandler}
    >
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index) => {
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          return (
            <FormControlLabel
              control={
                <Radio name={id} id={optionId(id, index)} color="primary" />
              }
              label={option.label}
              value={String(index)}
              key={option.label}
              disabled={disabled || itemDisabled}
            />
          );
        })}
    </RadioGroup>
  );
};

export default RadioWidget;
