"use client";

import { TextField } from "@mui/material";
import { NumberField } from "@base-ui-components/react/number-field";
import { WidgetProps } from "@rjsf/utils/lib/types";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
  BC_GOV_LINKS_COLOR,
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
}) => {
  const type = schema.type === "number" ? "number" : "text";
  const max =
    uiSchema?.["ui:options"]?.max && Number(uiSchema?.["ui:options"]?.max);
  const maxNumDbLimit = 2147483647;

  const maxNum = max || maxNumDbLimit;

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  const handleNumberChange = (val: number | null) => {
    if (!isNaN(Number(val)) && Number(val) > maxNum) return;

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
  };

  if (type === "number") {
    return (
      <NumberField.Root
        id={id}
        disabled={disabled || readonly}
        value={value}
        onValueChange={handleNumberChange}
        style={styles}
      >
        <NumberField.Group style={styles}>
          <NumberField.Input
            className={`w-full px-[14px] py-4 rounded-sm border border-transparent hover:border-[${BC_GOV_LINKS_COLOR}]`}
            style={styles}
            // sx doesn't like numberInput and tailwind doesn't like dynamic colors
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = BC_GOV_LINKS_COLOR;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "transparent";
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
        name={id}
        value={value}
        onChange={handleChange}
        sx={styles}
        placeholder={placeholder}
      />
    );
  }
};
export default TextWidget;
