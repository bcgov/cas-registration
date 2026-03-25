"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import AlertIcon from "@bciers/components/icons/AlertIcon";

/**
 * Custom FieldTemplate for the `annualFuelAmount` field
 *
 * Dynamically replaces the static "(fuel unit)" placeholder in the label with
 * the actual unit of the selected fuel
 *
 * Steps:
 * 1. parse the RJSF field `id` to determine the path to the parent fuel item
 * 2. traverse `formContext.activityFormData` to find `fuelType.fuelUnit`
 * 3. substitute unit into the label
 */
function AnnualFuelAmountFieldTemplate({
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

  // Resolve fuel unit from form data using field id - example id: root_<path_segments>_fuels_<index>_annualFuelAmount
  // Need to navigate to the parent fuel item and read fuelType.fuelUnit
  let resolvedLabel = label;
  const activityFormData = formContext?.activityFormData;
  if (activityFormData && id) {
    const withoutRoot = id.replace(/^root_/, "");
    const withoutField = withoutRoot.replace(/_annualFuelAmount$/, "");
    // Split into path segments, converting numeric strings to array indices
    const segments = withoutField.split("_");

    // find the parent fuel item object in activityFormData
    let current: any = activityFormData;
    for (const segment of segments) {
      if (current === undefined || current === null) break;
      const index = Number(segment);
      if (!isNaN(index) && String(index) === segment) {
        current = current[index];
      } else {
        current = current[segment];
      }
    }

    // current should now be the fuel item object; read fuelType.fuelUnit
    const fuelUnit = current?.fuelType?.fuelUnit;
    if (fuelUnit) {
      resolvedLabel = `Annual Fuel Amount (${fuelUnit})`;
    } else {
      // fuel not selected yet – display a default label
      resolvedLabel = "Annual Fuel Amount";
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
              {resolvedLabel}
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
            <p>{options.displayUnit as any}</p>
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

export default AnnualFuelAmountFieldTemplate;
