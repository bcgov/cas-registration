import { WidgetProps } from "@rjsf/utils/lib/types";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import React from "react";

const CheckboxGroupWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  value = [],
  required,
  options,
  uiSchema,
  readonly,
}) => {
  const alignment = (uiSchema?.["ui:options"]?.alignment as string) || "center";
  const columns = uiSchema?.["ui:options"]?.columns || 2;
  const checkboxOptions = options.enumOptions || [];

  const handleCheckboxChange =
    (option: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (readonly) return;

      const newValue = event.target.checked
        ? [...value, option] // add if checked
        : value.filter((v: string) => v !== option);
      onChange(newValue);
    };

  return (
    <div>
      <FormGroup
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          alignItems: alignment,
        }}
      >
        {checkboxOptions.map((option: any, index: number) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={value.includes(option.value)}
                onChange={handleCheckboxChange(option.value)}
                disabled={disabled}
                id={`${id}_${index}`}
                required={required}
                aria-label={option.label || option.value}
                readOnly={readonly}
              />
            }
            label={option.label || option.value}
          />
        ))}
      </FormGroup>
    </div>
  );
};

export default CheckboxGroupWidget;
