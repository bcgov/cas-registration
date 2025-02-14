"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import AlertIcon from "@bciers/components/icons/AlertIcon";

function GridItemFieldTemplate({
  id,
  label,
  rawErrors,
  required,
  children,
  uiSchema,
}: FieldTemplateProps) {
  const isErrors = rawErrors && rawErrors.length > 0;
  const error = rawErrors && rawErrors[0];

  // UI Schema options
  const options = uiSchema?.["ui:options"] || {};
  const isLabel = options?.label !== false;

  return (
    <div className="flex flex-col justify-between w-full m-4 md:mb-2">

       {isLabel && (
          <div>
            <label htmlFor={id} className="font-bold">
              {label}
              {required && "*"}
            </label>
          </div>
        )}

        <div>
          {children}
        </div>
        
        {isErrors && (
          <div
            className="w-full flex text-red-600"
            role="alert"
          >
            <div className="hidden md:block mr-3">
              <AlertIcon />
            </div>
            <span>{error}</span>
          </div>
        )}

    </div>
  );
}

export default GridItemFieldTemplate;
