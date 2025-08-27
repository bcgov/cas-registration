import React, { useState } from "react";
import { FieldDisplay } from "./FieldDisplay";
import { StatusLabel } from "@bciers/components/form/fields/StatusLabel";

interface Field {
  label?: string;
  key?: string;
  heading?: string | React.ReactNode;
  unit?: string;
  showSeparator?: boolean;
  isDate?: boolean;
}

interface SectionProps {
  title?: string;
  fields: Field[];
  data: Record<string, any>;
  expandable?: boolean;
  isAdded?: boolean;
  isDeleted?: boolean;
  showModifiedValues?: boolean;
}

/**
 * Traverses the object step by step following the keys in the path.
 * Returns `undefined` if the path does not exist or the object is null/undefined.
 *
 * @param obj - The object to retrieve the value from.
 * @param path - Dot-separated string representing the property path (e.g. "user.address.city").
 * @returns The value at the given path, or `undefined` if not found.
 */
function getNestedValue(obj: any, path?: string) {
  if (!obj || !path) return undefined;

  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export const SectionReview: React.FC<React.PropsWithChildren<SectionProps>> = ({
  title,
  fields,
  data,
  expandable = false,
  isAdded = false,
  isDeleted = false,
  showModifiedValues = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <section className="mb-6">
      <div className="w-full form-group field field-object form-heading-label flex items-center">
        {title && (
          <div className="form-heading text-xl font-bold flex items-center">
            {expandable && (
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                aria-label={isExpanded ? "Collapse section" : "Expand section"}
                className="ml-2 text-bc-bg-blue"
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                  fontSize: "1.25rem",
                  lineHeight: 1,
                }}
                type="button"
              >
                {isExpanded ? "▼" : "►"}
              </button>
            )}
            {title}
            {isAdded && <StatusLabel type="added" />}
            {isDeleted && <StatusLabel type="deleted" />}
          </div>
        )}
      </div>

      {(!expandable || isExpanded) && (
        <>
          {fields
            .filter(({ key, heading }) => {
              if (heading) return true;
              if (!showModifiedValues) return true;
              const value = key ? getNestedValue(data, key) : undefined;
              if (!value) return false;
              return (
                (typeof value === "object" && "changeType" in value) ||
                Object.values(value || {}).some(
                  (v) => v && typeof v === "object" && "changeType" in v,
                )
              );
            })
            .map(
              ({ label, key, heading, unit, showSeparator, isDate }, idx) => {
                if (heading) {
                  return (
                    <div
                      key={`heading-${idx}`}
                      className="py-2 w-full font-bold text-bc-bg-blue mb-4"
                    >
                      {heading}
                    </div>
                  );
                }

                const nestedValue = key ? getNestedValue(data, key) : undefined;

                return (
                  <FieldDisplay
                    key={`${key || "field"}-${idx}`}
                    label={label!}
                    value={nestedValue?.value || nestedValue}
                    unit={unit}
                    showSeparator={showSeparator}
                    isDate={isDate}
                    isDeleted={isDeleted}
                    oldValue={nestedValue?.oldValue}
                    changeType={nestedValue?.changeType}
                  />
                );
              },
            )}

          {children}
        </>
      )}
    </section>
  );
};
