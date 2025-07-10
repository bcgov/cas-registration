import React from "react";
import { LIGHT_GREY_BG_COLOR } from "@bciers/styles";

interface FieldDisplayProps {
  label: string;
  value: any;
  unit?: string;
  showSeparator?: boolean;
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
}) => {
  const formattedValue =
    value === null || value === undefined ? (
      <span>N/A</span>
    ) : typeof value === "boolean" ? (
      <span>{value ? "Yes" : "No"}</span>
    ) : typeof value === "string" && value.includes(";") ? (
      value.split(";").map((item, idx) => <div key={idx}>- {item.trim()}</div>)
    ) : (
      <span>{value}</span>
    );

  return (
    <div className="w-full my-3">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "300px 300px 220px",
          columnGap: "3rem",
          alignItems: "start",
        }}
      >
        <label className="font-semibold">{label}</label>
        <div>{formattedValue}</div>
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
