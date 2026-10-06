import { WidgetProps, getUiOptions } from "@rjsf/utils";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import React from "react"; // Ensure this is imported

const CheckboxWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  label,
  value,
  required,
  uiSchema,
  registry,
}) => {
  const { alignment = "center", label: checkboxLabel = label } = getUiOptions(
    uiSchema,
    registry.globalUiOptions,
  );
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={typeof value === "undefined" ? false : value}
          value={value}
          inputProps={{ id }}
          required={required}
          aria-label={label}
          disabled={disabled}
          onChange={(event: { target: { checked: any } }) =>
            onChange(event.target.checked)
          }
          className={alignment === "top" ? "pt-0.5" : ""}
        />
      }
      label={checkboxLabel} // Render the custom label or fallback label
      className={alignment === "top" ? "items-start" : "items-center"}
    />
  );
};

export default CheckboxWidget;
