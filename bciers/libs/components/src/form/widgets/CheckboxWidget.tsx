import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { getUiOptions } from "@rjsf/utils";
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
          sx={{
            ...(alignment === "top" && { paddingTop: "2px" }), // Apply alignment style if top
          }}
        />
      }
      label={checkboxLabel} // Render the custom label or fallback label
      style={{
        alignItems: alignment === "top" ? "flex-start" : "center", // Handle alignment for label
      }}
    />
  );
};

export default CheckboxWidget;
