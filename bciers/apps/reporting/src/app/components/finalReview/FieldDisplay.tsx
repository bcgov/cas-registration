import React from "react";

interface FieldDisplayProps {
  label: string;
  value: any;
  unit?: string;
  showHr?: boolean;
}

export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  label,
  value,
  unit,
  showHr = true,
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
      {showHr && (
        <hr
          className="mt-5"
          style={{
            border: "none",
            height: "1px",
            backgroundColor: "#ECEAE8",
          }}
        />
      )}
    </div>
  );
};
