import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const CheckboxWidgetLeft: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  label,
  value,
  required,
  readonly,
}) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          inputProps={{ id }}
          checked={typeof value === "undefined" ? false : value}
          value={value}
          required={required}
          disabled={disabled || readonly}
          onChange={(event: { target: { checked: boolean } }) =>
            onChange(event.target.checked)
          }
        />
      }
      label={label}
      sx={{ "& .MuiFormControlLabel-label": { fontWeight: "bold" } }}
    />
  );
};

export default CheckboxWidgetLeft;
