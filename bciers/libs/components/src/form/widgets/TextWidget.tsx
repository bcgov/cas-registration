"use client";

import { TextField } from "@mui/material";
import { NumberField } from "@base-ui-components/react/number-field";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

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
  // check activity forms in reporting
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
        value={value}
        onValueChange={handleNumberChange}
        max={maxNum}
        style={widthStyle}
        format={{ maximumFractionDigits: 4 }}
      >
        <NumberField.Group>
          <NumberField.Input aria-label={name} style={numberStyles} />
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
