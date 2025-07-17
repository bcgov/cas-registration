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
}) => {
  const formattedValue =
    value === null || value === undefined ? (
      <span>N/A</span>
    ) : isDate ? (
      <span>{formatDate(value, "MMM DD, YYYY")}</span>
    ) : typeof value === "boolean" ? (
      <span>{value ? "Yes" : "No"}</span>
    ) : typeof value === "string" && value.includes(";") ? (
      <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
        {value.split(";").map((item, idx) => (
          <li key={idx}>- {item.trim()}</li>
        ))}
      </ul>
    ) : (
      <span>{value}</span>
    );

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
              <NumberField.Input style={numberStyles} name={label} />
            </NumberField.Group>
          </NumberField.Root>
        ) : (
          <div>{formattedValue}</div>
        )}
        {unit ? (
          <div className="text-bc-bg-blue relative flex items-center">
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
