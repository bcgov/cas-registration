import React from "react";
import {
  verticalBorder,
  excludedKeys,
} from "@reporting/src/app/components/changeReview/constants/styles";

export function renderObject(
  obj: unknown,
  labelPrefix = "",
  isDeleted = false,
): React.ReactNode {
  const deletedStyles = isDeleted
    ? { textDecoration: "line-through", color: "#666" }
    : {};

  if (Array.isArray(obj)) {
    return obj.map((item, index) => (
      <div
        key={`${labelPrefix}-${index}`}
        style={{
          marginLeft: 20,
          marginBottom: 8,
          ...(labelPrefix.toLowerCase() === "emissions" ? verticalBorder : {}),
        }}
      >
        {labelPrefix && (
          <strong style={deletedStyles}>{`${labelPrefix} ${
            index + 1
          }:`}</strong>
        )}
        <div style={{ marginLeft: 10 }}>
          {renderObject(item, labelPrefix, isDeleted)}
        </div>
      </div>
    ));
  }

  if (obj && typeof obj === "object") {
    return Object.entries(obj).map(([key, value], idx) => (
      <div key={`${key}-${idx}`} style={{ marginBottom: 4 }}>
        {!excludedKeys.includes(key.toLowerCase()) && (
          <strong style={deletedStyles}>
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase())}
          </strong>
        )}
        <span style={deletedStyles}>
          {typeof value === "object" && value !== null
            ? renderObject(value, key, isDeleted)
            : ` ${String(value)}`}
        </span>
      </div>
    ));
  }

  return <span style={deletedStyles}>{String(obj)}</span>;
}
