"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import AlertIcon from "@bciers/components/icons/AlertIcon";

function parseCurrentFuelItem(parentPath: string, current: any) {
  for (const segment of parentPath.split("_")) {
    if (current === undefined || current === null) break;
    const index = Number(segment);
    current =
      !isNaN(index) && String(index) === segment
        ? current[index]
        : current[segment];
  }
  return current;
}

/**
 * Generic FieldTemplate for fuel amount fields (e.g. `annualFuelAmount`,
 * `q1FuelAmount`, `q2FuelAmount`, etc.)
 *
 * Dynamically appends the label with the actual unit of the selected fuel (e.g. "kilolitres").
 *
 * Steps:
 * 1. Strip the last path segment (the field name itself) from the RJSF `id`
 *    to obtain path to the parent fuel item object
 * 2. traverse `formContext.activityFormData` along that path
 * 3. read `fuelType.fuelUnit` from the fuel item
 * 4. substitute in ${fuelUnit} into schema label (no fuelUnit will be placed if a fuel hasn't been selected yet)
 *
 * Because the field name is derived from the `id` at runtime, this template
 * works for *any* fuel amount field (whether it's annual, quarterly, monthly) without modification
 */
function FuelAmountFieldTemplate({
  id,
  label,
  help,
  description,
  rawErrors,
  required,
  children,
  uiSchema,
  classNames,
  formContext,
}: FieldTemplateProps) {
  const isHidden = uiSchema?.["ui:widget"] === "hidden";
  if (isHidden) return null;

  const isErrors = rawErrors && rawErrors.length > 0;
  const error = rawErrors && rawErrors[0];

  const options = uiSchema?.["ui:options"] || {};
  const isLabel = options?.label !== false;
  const labelClassNames = (options?.labelClassNames as string) ?? "lg:w-3/12";

  let cellWidth = "lg:w-4/12";
  if (options?.inline) cellWidth = "lg:w-full";
  else if (options?.wide) cellWidth = "lg:w-8/12";

  // Resolve the fuel unit from the live form data
  //
  // The RJSF `id` for a field nested inside a fuel item looks like:
  //   root_<...path...>_fuels_<index>_<fieldName>
  //
  // Strip "root_" and the last "_<fieldName>" segment to get the path to
  // the parent fuel item, then navigate activityFormData along that path
  const activityFormData = formContext?.activityFormData;
  if (activityFormData && id) {
    // Remove the "root_" prefix and drop the last "_<fieldName>" segment
    const withoutRoot = id.replace(/^root_/, "");
    const lastUnderscore = withoutRoot.lastIndexOf("_");
    const parentPath =
      lastUnderscore !== -1 ? withoutRoot.slice(0, lastUnderscore) : "";

    let current: any = activityFormData;
    if (parentPath) {
      current = parseCurrentFuelItem(parentPath, current);
    }

    // `current` is the fuel item object
    const fuelUnit = current?.fuelType?.fuelUnit;
    if (fuelUnit) {
      // append "(${fuelUnit})" to the label
      label = label + ` (${fuelUnit})`;
    }
  }

  return (
    <div className="mb-4 md:mb-2">
      <div
        className={`flex flex-col md:flex-row items-start md:items-center ${classNames}`}
      >
        {isLabel && (
          <div className={`w-full ${labelClassNames}`}>
            <label htmlFor={id} className="font-bold">
              {label}
              {required && "*"}
            </label>
          </div>
        )}
        <div className={`relative flex items-center w-full ${cellWidth}`}>
          {children}
        </div>
        {options.displayUnit && (
          <div
            className={`relative flex items-center w-full ml-2 text-bc-bg-blue ${cellWidth}`}
          >
            <p>{options.displayUnit as string}</p>
          </div>
        )}
        {isErrors && (
          <div
            className="w-full md:w-4/12 flex items-center text-red-600 ml-0 md:ml-4"
            role="alert"
          >
            <div className="hidden md:block mr-3">
              <AlertIcon />
            </div>
            <span>{error}</span>
          </div>
        )}
      </div>
      <div
        className={`flex flex-col md:flex-row items-start md:items-center ${classNames}`}
      >
        {isLabel && <div className="w-full lg:w-3/12" />}
        {description || help ? (
          <div className={`relative flex items-center w-full ${cellWidth}`}>
            {description}
            {help}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default FuelAmountFieldTemplate;
