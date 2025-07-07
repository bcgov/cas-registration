import React, { useState } from "react";
import { FieldDisplay } from "./FieldDisplay";

interface Field {
  label?: string;
  key?: string;
  heading?: string;
  unit?: string;
}

interface SectionProps {
  title?: string;
  fields: Field[];
  data: Record<string, any>;
  expandable?: boolean;
}

function getNestedValue(obj: any, path?: string) {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export const SectionReview: React.FC<React.PropsWithChildren<SectionProps>> = ({
  title,
  fields,
  data,
  expandable = false,
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
          </div>
        )}
      </div>

      {(!expandable || isExpanded) && (
        <>
          {fields.map(({ label, key, heading, unit }, idx) => {
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

            const value = getNestedValue(data, key);

            return (
              <FieldDisplay
                key={key || `field-${idx}`}
                label={label!}
                value={value}
                unit={unit}
              />
            );
          })}

          {children}
        </>
      )}
    </section>
  );
};
