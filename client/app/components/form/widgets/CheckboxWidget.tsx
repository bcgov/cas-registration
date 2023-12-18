import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";

const CheckboxWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  label,
  value,
  required,
}) => (
  <div className="flex items-center">
    <label className="font-bold mr-4">{label}</label>
    <Checkbox
      id={id}
      checked={typeof value === "undefined" ? false : value}
      value={value}
      required={required}
      aria-label={label}
      disabled={disabled}
      onChange={(event: { target: { checked: any } }) =>
        onChange(event.target.checked)
      }
    />
  </div>
);

export default CheckboxWidget;
