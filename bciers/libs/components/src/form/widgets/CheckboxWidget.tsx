import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const CheckboxWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  label,
  value,
  required,
  uiSchema,
}) => {
  const alignment = uiSchema?.["ui:options"]?.alignment || "center";
  const customLabel = uiSchema?.["ui:options"]?.label || label;

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
            ...(alignment === "top" && { paddingTop: "2px" }),
          }}
        />
      }
      label={customLabel}
      style={{
        alignItems: alignment === "top" ? "flex-start" : "center",
      }}
    />
  );
};

export default CheckboxWidget;
