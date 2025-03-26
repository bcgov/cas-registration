"use client";
import React from "react";

interface ComplianceHeadingProps {
  className?: string;
}

export const ComplianceHeading: React.FC<ComplianceHeadingProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`w-full form-group field field-object form-heading-label ${className}`}
    >
      <div
        className="form-heading"
        style={{ borderTopWidth: "1px", borderBottomWidth: "1px" }}
      >
        Report Information
      </div>
    </div>
  );
};

export default ComplianceHeading;
