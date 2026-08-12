"use client";

import { useEffect } from "react";
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
}: WidgetProps) => {
  useEffect(() => {
    if (!value) {
      onChange(DEFAULT_VALUE);
    }
  }, [value, onChange]);

  const selectedValue = (value as string) || DEFAULT_VALUE;

  return (
    <div className="w-full">
      <p className="mb-2">{label}</p>
      <div
        className="flex flex-nowrap gap-0"
        role="radiogroup"
        aria-label={label}
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
