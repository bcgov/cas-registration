"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import AlertIcon from "@bciers/components/icons/AlertIcon";

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
}: FieldTemplateProps) {
  const isHidden = uiSchema?.["ui:widget"] === "hidden";
  if (isHidden) return null;

  const isErrors = rawErrors && rawErrors.length > 0;
  const error = rawErrors && rawErrors[0];

  // UI Schema options
  const options = uiSchema?.["ui:options"] || {};
  const isLabel = options?.label !== false;
  // Allow width override if inline is true
  const inline = options?.inline;
  const wide = options?.wide;
  const cellWidth = inline ? "lg:w-full" : wide ? "lg:w-8/12" : "lg:w-4/12";

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
          <div className="w-full lg:w-3/12">
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
            {noteDescription ? (
              <small className="inline-display">{description}</small>
            ) : (
              <>
                {description}
                {help}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default InlineFieldTemplate;
