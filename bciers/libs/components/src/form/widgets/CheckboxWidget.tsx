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
}) => {
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
    />
  );
};

export default CheckboxWidget;
