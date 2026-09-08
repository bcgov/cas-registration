"use client";

import { FieldTemplateProps, Registry } from "@rjsf/utils";
import AlertIcon from "@bciers/components/icons/AlertIcon";

type UnitOption =
  | string
  | { field: string; source?: "product" | "form" }
  | Array<string | { field: string; source?: "product" | "form" }>;

/**
 * Resolves the display unit text for a field from a configured `unit` option.
 *
 * Supported token shapes:
 * - `"tCO2e"` (static text)
 * - `{ field: "unit" }` (dynamic value)
 * - `["tCO2e/", { field: "unit" }]` (composed string)
 *
 * Resolution order for dynamic tokens:
 * - If `options.arrayPath` is provided, extract the row index from the RJSF `id`
 *   and read from `formContext.getArrayItem(arrayPath, index)[field]`.
 * - Otherwise read from `formContext[field]`.
 *
 * Returns `undefined` when no unit option is configured.
 *
 * Example usage:
 *    annual_production: {
        "ui:FieldTemplate": InlineFieldTemplate,
        "ui:options": {
          unit: { source: "product", field: "unit" },
          arrayPath: "production_data",
        },
      }
    ^ this will examine the "production_data" array in the RJSF form data, and for the
    "product" object being rendered, will display the value in the "unit" attribute.
 */
const resolveUnit = (
  unitOption: UnitOption | undefined,
  id: string,
  registry?: Registry,
  options?: Record<string, unknown>,
): string | undefined => {
  if (!unitOption) return;

  // normalize to array if it isn't already
  const parts = Array.isArray(unitOption) ? unitOption : [unitOption];
  const arrayPath =
    typeof options?.arrayPath === "string" ? options.arrayPath : undefined;

  return parts
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }
      if (arrayPath) {
        // regex search - generic index extraction
        const match = /_(\d+)_/.exec(id);
        const index = match ? Number(match[1]) : null;

        if (index !== null) {
          const item = registry?.formContext?.getArrayItem?.(arrayPath, index);
          return item?.[part.field];
        }
      }
      return registry?.formContext?.[part.field];
    })
    .join("");
};

function InlineFieldTemplate({
  id,
  label,
  help,
  description,
  rawErrors,
  required,
  children,
  uiSchema,
  classNames,
  registry,
  schema,
}: FieldTemplateProps) {
  const isHidden = uiSchema?.["ui:widget"] === "hidden";
  if (isHidden) return null;

  const isErrors = rawErrors && rawErrors.length > 0;
  const error = rawErrors && rawErrors[0];

  // UI Schema options
  const options = uiSchema?.["ui:options"] || {};
  const isLabel = options?.label !== false;
  const unitOption = (options.unit ?? options.displayUnit) as
    UnitOption | undefined;

  const resolvedUnit = resolveUnit(unitOption, id, registry, options);

  // Check for noteDescription in ui:options
  let noteDescription = options?.noteDescription;
  if (noteDescription) {
    noteDescription = <b>Note:</b> + " " + noteDescription; // Modify here, e.g., prepend "Note:"
  }

  return (
    <div className="mb-4 md:mb-2">
      <div
        className={`flex flex-col md:flex-row items-start md:items-center ${classNames}`}
      >
        {isLabel && (
          <div className="w-full md:basis-1/4 md:grow-0 md:shrink-0">
            <label htmlFor={id} className="font-bold">
              {label}
              {required && "*"}
            </label>
          </div>
        )}
        <div className="relative flex items-center w-full md:basis-1/3 md:grow-0 md:shrink-0">
          {children}
        </div>

        {(resolvedUnit || schema.methodology_units) && (
          <div className="flex items-center md:grow-0 md:shrink-0 md:ml-2 text-bc-bg-blue whitespace-nowrap">
            {resolvedUnit && <p>{resolvedUnit}</p>}

            {schema.methodology_units && (
              <p>{schema.methodology_units as any}</p>
            )}
          </div>
        )}

        <div
          className="w-full md:w-auto md:flex-1 md:min-w-0 flex items-center text-red-600 md:ml-3"
          role={isErrors ? "alert" : undefined}
        >
          {isErrors && (
            <>
              <div className="hidden md:block mr-2 shrink-0">
                <AlertIcon />
              </div>
              <span>{error}</span>
            </>
          )}
        </div>
      </div>

      {/* Description / help row */}
      {(description || help) && (
        <div
          className={`flex flex-col md:flex-row items-start md:items-center ${classNames}`}
        >
          {isLabel && (
            <div className="w-full md:basis-1/4 md:grow-0 md:shrink-0" />
          )}

          <div className="relative flex items-center w-full md:basis-1/3 md:grow-0 md:shrink-0">
            {noteDescription ? (
              <small className="inline-display">{description}</small>
            ) : (
              <>
                {description}
                {help}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InlineFieldTemplate;
