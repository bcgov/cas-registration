import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";

const CheckboxWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  label,
  value,
  required,
}) => {
  return (
    <div className="flex">
      <div className="flex flex-col justify-start [&>span]:pt-0">
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
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default CheckboxWidget;
