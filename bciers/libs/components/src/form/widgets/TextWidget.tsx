"use client";

import { TextField } from "@mui/material";
import { NumberField } from "@base-ui-components/react/number-field";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
  BC_GOV_LINKS_COLOR,
} from "@bciers/styles/colors";

/**
 * Transforms the given value into a number if it is defined. Handles 0s.
 *
 * @param value - The value to be transformed. Can be of any type.
 * @returns The numeric representation of the value if it is defined,
 *          or `undefined` if the value is falsy (but not 0).
 */
export const transformToNumberOrUndefined = (
  value: any,
): number | undefined => {
  if (value === 0) return 0;
  return value ? Number(value) : undefined;
};

const TextWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  schema,
  uiSchema,
  placeholder,
  value,
  name,
}) => {
  const type = schema.type === "number" ? "number" : "text";

  const max =
    uiSchema?.["ui:options"]?.max && Number(uiSchema?.["ui:options"]?.max);
  const maxNumDbLimit = Number.MAX_SAFE_INTEGER;

  const maxNum = max || maxNumDbLimit;

  const decimalPoints =
    uiSchema?.["ui:options"]?.decimalPoints &&
    Number(uiSchema?.["ui:options"]?.decimalPoints);

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  const handleNumberChange = (val: number | null) => {
    onChange(val);
  };

  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor,
      },
    },
    font: "inherit",
  };

  const numberStyles = {
    border: "1px solid",
    borderColor: borderColor,
    font: "inherit",
    width: "100%",
    padding: "14px",
    borderRadius: "4px",
  };

  const widthStyle = {
    width: "100%",
  };

  if (type === "number") {
    return (
      <NumberField.Root
        id={id}
        name={name}
        disabled={disabled || readonly}
        value={transformToNumberOrUndefined(value)}
        onValueChange={handleNumberChange}
        max={maxNum}
        style={widthStyle}
        format={{
          maximumFractionDigits: decimalPoints || 4,
          minimumFractionDigits: 0,
        }}
      >
        <NumberField.Group>
          <NumberField.Input
            aria-label={name}
            style={numberStyles}
            // sx doesn't like numberInput and tailwind doesn't like dynamic colors
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = BC_GOV_LINKS_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = borderColor;
            }}
          />
        </NumberField.Group>
      </NumberField.Root>
    );
  } else {
    return (
      <TextField
        id={id}
        disabled={disabled || readonly}
        name={name}
        value={value}
        onChange={handleChange}
        sx={styles}
        placeholder={placeholder}
      />
    );
  }
};
export default TextWidget;
