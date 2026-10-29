import { WidgetProps } from "@rjsf/utils";
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
        checked={typeof value === "undefined" ? false : value}
        value={value}
        slotProps={{ input: { id } }}
        required={required}
        disabled={disabled || readonly}
        onChange={(event: { target: { checked: any } }) =>
          onChange(event.target.checked)
        }
      />
      <label htmlFor={id} className="font-bold mr-4">
        {label}
      </label>
    </div>
  );
};

export default CheckboxWidgetLeft;
