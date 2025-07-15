import React from "react";
import { LIGHT_GREY_BG_COLOR } from "@bciers/styles";
import { formatDate } from "@reporting/src/app/utils/formatDate";
import { NumberField } from "@base-ui-components/react/number-field";
import transformToNumberOrUndefined from "@bciers/utils/src/transformToNumberOrUndefined";
import { numberStyles } from "../formCustomization/FinalReviewStringField";

interface FieldDisplayProps {
  label: string;
  value: any;
  unit?: string;
  showSeparator?: boolean;
  isDate?: boolean;
  isDeleted?: boolean;
  isAdded?: boolean;
  oldValue?: any;
  changeType?: "modified" | "added" | "removed";
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
  isDeleted = false,
  isAdded = false,
  oldValue,
  changeType,
}) => {
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
    if (typeof val === "string" && val.includes(";")) {
      return (
        <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
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
      <div
        className="grid"
        style={{
          gridTemplateColumns: "400px 200px 300px",
          columnGap: "3rem",
          alignItems: "start",
        }}
      >
        <label className="font-semibold">{label}</label>
        {typeof value === "number" ? (
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
            <span style={{ textDecoration: "line-through", color: "#666" }}>
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
        {unit ? (
          <div
            className="text-bc-bg-blue relative flex items-center"
            style={deletedValueStyles}
          >
            {unit}
          </div>
        ) : (
          <div />
        )}
      </div>
      {showSeparator && (
        <hr
          className="mt-5"
          style={{
            border: "none",
            height: "1px",
            backgroundColor: LIGHT_GREY_BG_COLOR,
          }}
        />
      )}
    </div>
  );
};
