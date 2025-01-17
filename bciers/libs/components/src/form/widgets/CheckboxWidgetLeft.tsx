import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";

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
    <div className="flex items-center">
      <Checkbox
        id={id}
        checked={typeof value === "undefined" ? false : value}
        value={value}
        required={required}
        aria-label={label}
        disabled={disabled || readonly}
        onChange={(event: { target: { checked: any } }) =>
          onChange(event.target.checked)
        }
      />
      <label className="font-bold mr-4">{label}</label>
    </div>
  );
};

export default CheckboxWidgetLeft;
