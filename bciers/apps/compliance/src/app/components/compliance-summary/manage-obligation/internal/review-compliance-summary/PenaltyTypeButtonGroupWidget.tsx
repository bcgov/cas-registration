"use client";

import { WidgetProps } from "@rjsf/utils";

const DEFAULT_VALUE = "automatic_overdue";

const options = [
  {
    value: "automatic_overdue",
    label: "Automatic overdue",
  },
  {
    value: "ggeapar",
    label: "GGEAPAR",
  },
] as const;

export const PenaltyTypeButtonGroupWidget = ({
  label,
  value,
  onChange,
  disabled,
  readonly,
  options: uiOptions,
}: WidgetProps) => {
  const selectedValue = (value as string) || DEFAULT_VALUE;
  const showLabel = (uiOptions as any)?.label !== false;
  // set default label if none is specified
  const ariaLabel =
    typeof label === "string" && label.trim().length > 0
      ? label
      : "Select penalty type";

  return (
    <div className="w-full">
      <p className="mb-2">{label}</p>
      {showLabel && label ? <p className="mb-2">{label}</p> : null}
      <div
        className="flex flex-nowrap gap-0"
        role="radiogroup"
        aria-label={ariaLabel}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled || readonly}
              onClick={() => onChange(option.value)}
              style={{
                width: "525px",
                minWidth: "525px",
                maxWidth: "525px",
                height: "37.5px",
                minHeight: "37.5px",
                maxHeight: "37.5px",
              }}
              className={[
                "shrink-0 basis-[525px] border font transition-colors first:rounded-l last:rounded-r",
                isSelected
                  ? "border-bc-blue bg-bc-bg-blue text-white"
                  : "border-bc-blue bg-white text-bc-links",
                disabled || readonly ? "cursor-not-allowed opacity-50" : "",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
