import React from "react";
import { NumberField } from "@base-ui/react/number-field";
import transformToNumberOrUndefined from "@bciers/utils/src/transformToNumberOrUndefined";
import { numberStyles } from "@reporting/src/app/components/finalReview/formCustomization/FinalReviewStringField";
import {
  formatKey,
  singularizeLabel,
  sortMethodologyEntries,
} from "@reporting/src/app/components/shared/activityRenderUtils";
import {
  dataCardStyle,
  verticalBorder,
} from "@reporting/src/app/components/changeReview/constants/styles";

export const getDeletedStyles = (isDeleted: boolean): React.CSSProperties =>
  isDeleted ? { textDecoration: "line-through", color: "#666" } : {};

export const renderNumberField = (
  key: string,
  deletedStyles: React.CSSProperties,
  value: number,
): React.ReactNode => (
  <NumberField.Root
    name={key}
    disabled
    value={transformToNumberOrUndefined(value)}
    format={{ maximumFractionDigits: 4 }}
  >
    <NumberField.Group>
      <NumberField.Input
        style={{ ...numberStyles, ...deletedStyles }}
        name={key}
      />
    </NumberField.Group>
  </NumberField.Root>
);

/** Renders a single `label: value` row. Handles numbers with NumberField, others as text. */
export const renderField = (
  key: string,
  value: unknown,
  deletedStyles: React.CSSProperties,
): React.ReactNode => {
  const label = <strong style={deletedStyles}>{formatKey(key)}:</strong>;
  const wrapper = (children: React.ReactNode) => (
    <div
      style={{
        marginBottom: 4,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {label}
      {children}
    </div>
  );
  if (typeof value === "number") {
    return wrapper(renderNumberField(key, deletedStyles, value));
  }
  return wrapper(<span style={deletedStyles}>{String(value)}</span>);
};

/** Renders a blue "N+1" section heading. */
export const renderHeading = (
  title: string,
  deletedStyles: React.CSSProperties,
) => (
  <strong
    className="text-bc-bg-blue relative flex items-center"
    style={deletedStyles}
  >
    {title}
  </strong>
);

/** Recursively renders a value as React nodes. Arrays get "N+1" headings, objects render key-value pairs, primitives render as text. Special cases: carbonate emissions, ordered units, methodology periods, and flat fuelType. */
export const renderObject = (
  obj: unknown,
  labelPrefix = "",
  isDeleted = false,
  reportingFieldDisplayTitleBySlug: Record<string, string>,
): React.ReactNode => {
  const deletedStyles = getDeletedStyles(isDeleted);

  // ---- Array branch -------------------------------------------------------
  if (Array.isArray(obj)) {
    return obj.map((item, index) => {
      const lower = labelPrefix.toLowerCase();
      const isObj = item && typeof item === "object" && !Array.isArray(item);

      // Special: sourceSubType units → reorder keys then delegate to renderObject
      if (lower === "units" && isObj && "sourceSubType" in item) {
        const unitObj = item as Record<string, unknown>;
        const orderedKeys = [
          "sourceSubType",
          ...Object.keys(unitObj).filter(
            (k) =>
              k !== "sourceSubType" &&
              k !== "type" &&
              !k.toLowerCase().includes("emissions"),
          ),
          ...Object.keys(unitObj).filter((k) =>
            k.toLowerCase().includes("emissions"),
          ),
        ];
        const orderedItem = Object.fromEntries(
          orderedKeys.map((k) => [k, unitObj[k]]),
        );
        return (
          <div key={`${labelPrefix}-${index}`} style={{ marginBottom: 12 }}>
            {renderHeading(`Source sub-type ${index + 1}:`, deletedStyles)}
            <div style={{ marginLeft: 10 }}>
              {renderObject(
                orderedItem,
                labelPrefix,
                isDeleted,
                reportingFieldDisplayTitleBySlug,
              )}
            </div>
          </div>
        );
      }

      // Special: carbonate-use emissions → "Carbonate N:" instead of "Emission N:"
      const singularLabel =
        lower === "emissions" && isObj && "carbonateType" in item
          ? "Carbonate"
          : labelPrefix
            ? singularizeLabel(labelPrefix)
            : "";

      const title = singularLabel ? `${singularLabel} ${index + 1}:` : "";
      const containerStyle = {
        marginLeft: 20,
        marginBottom: 8,
        ...(lower === "emissions" ? verticalBorder : {}),
      };

      return (
        <div key={`${labelPrefix}-${index}`} style={containerStyle}>
          {title && renderHeading(title, deletedStyles)}
          <div style={{ marginLeft: 10 }}>
            {renderObject(
              item,
              labelPrefix,
              isDeleted,
              reportingFieldDisplayTitleBySlug,
            )}
          </div>
        </div>
      );
    });
  }

  // ---- Object branch ------------------------------------------------------
  if (obj && typeof obj === "object") {
    return Object.entries(obj).map(([key, value], idx) => {
      const isObjOrArr = typeof value === "object" && value !== null;

      // Special: methodology object
      if (key === "methodology" && isObjOrArr && !Array.isArray(value)) {
        const mObj = value as Record<string, unknown>;
        const methodName =
          typeof mObj.methodology === "string" ? mObj.methodology : undefined;
        const rest = sortMethodologyEntries(
          Object.entries(mObj).filter(([k]) => k !== "methodology"),
        );

        return (
          <div key={`${key}-${idx}`} style={{ marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <strong style={deletedStyles}>Methodology:</strong>
              {methodName && <span style={deletedStyles}>{methodName}</span>}
            </div>
            {rest.map(([pKey, pVal], pIdx) => {
              // Any object-valued key (months, quarters, or any future period type)
              // is rendered as a blue sub-header with its fields indented beneath it.
              if (typeof pVal === "object" && pVal !== null) {
                return (
                  <div
                    key={`${pKey}-${pIdx}`}
                    style={{ marginLeft: 20, marginBottom: 8 }}
                  >
                    {renderHeading(`${formatKey(pKey)}:`, deletedStyles)}
                    <div style={{ marginLeft: 16 }}>
                      {renderObject(
                        pVal,
                        pKey,
                        isDeleted,
                        reportingFieldDisplayTitleBySlug,
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={`${pKey}-${pIdx}`}
                  style={{
                    marginBottom: 4,
                    marginLeft: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <strong style={deletedStyles}>
                    {reportingFieldDisplayTitleBySlug?.[pKey] ??
                      formatKey(pKey)}
                    :
                  </strong>
                  <span style={deletedStyles}>{String(pVal)}</span>
                </div>
              );
            })}
          </div>
        );
      }

      // Special: fuelType — flatten children, no label
      if (key === "fuelType" && isObjOrArr && !Array.isArray(value)) {
        return (
          <React.Fragment key={`${key}-${idx}`}>
            {renderObject(
              value,
              "",
              isDeleted,
              reportingFieldDisplayTitleBySlug,
            )}
          </React.Fragment>
        );
      }

      // Default: suppress label for array-container keys (their contents already
      // get "N+1" headings) and for fuelType (rendered flat with no wrapper).
      const suppressLabel = Array.isArray(value) || key === "fuelType";
      return (
        <div
          key={`${key}-${idx}`}
          style={{
            marginBottom: 4,
            ...(isObjOrArr
              ? {}
              : { display: "flex", alignItems: "center", gap: "4px" }),
          }}
        >
          {!suppressLabel && (
            <strong style={deletedStyles}>{formatKey(key)}:</strong>
          )}
          {isObjOrArr ? (
            <span style={deletedStyles}>
              {renderObject(
                value,
                key,
                isDeleted,
                reportingFieldDisplayTitleBySlug,
              )}
            </span>
          ) : typeof value === "number" ? (
            <NumberField.Root
              name={key}
              disabled
              value={transformToNumberOrUndefined(value)}
              format={{ maximumFractionDigits: 4 }}
            >
              <NumberField.Group>
                <NumberField.Input
                  style={{ ...numberStyles, ...deletedStyles }}
                  name={key}
                />
              </NumberField.Group>
            </NumberField.Root>
          ) : (
            <span style={deletedStyles}>{String(value)}</span>
          )}
        </div>
      );
    });
  }

  return <span style={getDeletedStyles(isDeleted)}>{String(obj)}</span>;
};

// ---------------------------------------------------------------------------
// Fuel-specific renderers
// ---------------------------------------------------------------------------

/** Renders a fuel source-type row (shows only "fuel name" and "fuel unit"). */
export const renderFuels = (
  sourceTypeValue: Record<string, any>,
  deletedStyles: React.CSSProperties,
) => (
  <div style={dataCardStyle}>
    {Object.entries(sourceTypeValue)
      .filter(([key]) => ["fuel name", "fuel unit"].includes(key.toLowerCase()))
      .map(([key, value]) => renderField(key, value, deletedStyles))}
  </div>
);
