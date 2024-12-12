"use client";
import React from "react";
import { TextareaAutosize } from "@mui/material";
import { WidgetProps } from "@rjsf/utils";
import {
  DARK_GREY_BG_COLOR,
  BC_GOV_SEMANTICS_RED,
} from "@bciers/styles/colors";

const TextAreaWidget: React.FC<WidgetProps> = ({
  disabled,
  id,
  onChange,
  rawErrors,
  readonly,
  placeholder,
  value,
}) => {
  const isError = rawErrors && rawErrors.length > 0;
  const borderColor = isError ? BC_GOV_SEMANTICS_RED : DARK_GREY_BG_COLOR;

  const styles: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    fontFamily: "BCSans, sans-serif",
    borderRadius: "4px",
    border: `1px solid ${borderColor}`,
    backgroundColor: isError ? "#ffe6e6" : "white",
    resize: "vertical",
  };

  return (
    <TextareaAutosize
      id={id}
      disabled={disabled || readonly}
      aria-label={placeholder || "Text area input"}
      value={value || ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      placeholder={placeholder}
      style={styles}
    />
  );
};

export default TextAreaWidget;
