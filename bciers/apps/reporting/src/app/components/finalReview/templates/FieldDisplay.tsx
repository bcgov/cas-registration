// typescript
import React from "react";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { NumberField } from "@base-ui/react/number-field";
import transformToNumberOrUndefined from "@bciers/utils/src/transformToNumberOrUndefined";
import { numberStyles } from "../formCustomization/FinalReviewStringField";

interface FieldDisplayProps {
  label: string;
  value: any;
  unit?: string;
  showSeparator?: boolean;
  isDate?: boolean;
  isYear?: boolean;
  isDeleted?: boolean;
  isAdded?: boolean;
  oldValue?: any;
  changeType?: "modified" | "added" | "removed";
  fieldKey?: string;
}

/**
 * FieldDisplay component is used to display a label, value, and optional unit in a structured format.
 * The `showSeparator` prop determines whether a horizontal separator should be displayed below the field.
 */
export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  label,
  value,
  unit,
  showSeparator = true,
  isDate = false,
  isYear = false,
  isDeleted = false,
  oldValue,
  changeType,
  fieldKey,
}) => {
  // Use a stacked layout on small screens and a responsive flex with fixed widths on md+
  const isReasonForChange = fieldKey === "reason_for_change";

  const formatValue = (val: any) => {
    if (val === null || val === undefined) {
      return <span>N/A</span>;
    }
    if (isDate) {
      return <span>{formatDate(val, "MMM DD, YYYY")}</span>;
    }
    if (typeof val === "boolean") {
      return <span>{val ? "Yes" : "No"}</span>;
    }
    if (typeof val === "string" && val.includes(";") && !isReasonForChange) {
      return (
        <ul className="list-none pl-0 m-0">
          {val.split(";").map((item, idx) => (
            <li key={idx}>- {item.trim()}</li>
          ))}
        </ul>
      );
    }
    return <span>{val}</span>;
  };

  // Common styles for deleted items - only apply to values, not labels
  const deletedValueStyles = isDeleted
    ? {
        textDecoration: "line-through",
        color: "#666",
      }
    : {};

  return (
    <div className="w-full my-3">
      {/* stacked on mobile, horizontal on md+ */}
      <div
        className={`flex flex-col md:flex-row md:gap-x-12 gap-y-2 items-start`}
      >
        <div className={`w-full md:w-3/12`}>
          <label className="font-semibold">{label}</label>
        </div>

        <div
          className={`w-full ${isReasonForChange ? "md:w-9/12" : "md:w-4/12"}`}
        >
          {typeof value === "number" && !isYear ? (
            <NumberField.Root
              name={label}
              disabled
              value={transformToNumberOrUndefined(value)}
              format={{
                maximumFractionDigits: 4,
              }}
            >
              <NumberField.Group>
                <NumberField.Input
                  style={{
                    ...numberStyles,
                    ...deletedValueStyles,
                  }}
                  name={label}
                />
              </NumberField.Group>
            </NumberField.Root>
          ) : changeType === "modified" ? (
            <>
              <span className="line-through text-bc-component-grey">
                {formatValue(oldValue)}
                {unit && ` ${unit}`}
              </span>
              <span className="mx-2">→</span>
              <span>
                {formatValue(value)}
                {unit && ` ${unit}`}
              </span>
            </>
          ) : (
            <div style={deletedValueStyles}>{formatValue(value)}</div>
          )}
        </div>

        {/* unit / extra column - render only for non-reason_for_change to avoid 3-column layout */}
        {!isReasonForChange ? (
          <div
            className={`w-full md:w-5/12 flex items-center ${
              unit && !isDeleted ? "text-bc-bg-blue" : ""
            }`}
            style={deletedValueStyles}
          >
            {unit ? <div className="relative">{unit}</div> : <div />}
          </div>
        ) : null}
      </div>

      {showSeparator && (
        <hr className="mt-5 border-none h-px bg-bc-bg-light-grey" />
      )}
    </div>
  );
};
