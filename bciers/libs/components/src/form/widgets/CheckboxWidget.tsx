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
        />
      }
      label={label}
      style={{
        alignItems: alignment === "top" ? "flex-start" : "center",
      }}
    />
  );
};

export default CheckboxWidget;
