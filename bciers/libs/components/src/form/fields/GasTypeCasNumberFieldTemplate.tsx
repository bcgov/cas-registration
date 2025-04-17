"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import AlertIcon from "@bciers/components/icons/AlertIcon";
import { TextField } from "@mui/material";

function InlineFieldTemplate({
  id,
  label,
  rawErrors,
  required,
  children,
  uiSchema,
  classNames,
  formContext,
  formData,
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
  const cellWidth = inline ? "lg:w-full" : "lg:w-4/12";

  // Find the selected gasType object to extract the CAS Number for display in the CAS Registry Number field below
  const selectedGasTypeObject = formContext?.gasTypes?.find(
    (obj: {
      id: number;
      name: string;
      chemical_formula: string;
      cas_number: string;
    }) => {
      return obj.chemical_formula === formData;
    },
  );

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
        className={`flex flex-col md:flex-row items-start md:items-center pt-2 ${classNames}`}
      >
        {isLabel && (
          <div className="w-full lg:w-3/12">
            <label className="font-bold">CAS Registry Number</label>
          </div>
        )}
        <div className={`relative flex items-center w-full ${cellWidth}`}>
          <TextField
            id="outlined-basic"
            variant="outlined"
            fullWidth
            disabled
            defaultValue={selectedGasTypeObject.cas_number}
          />
        </div>
      </div>
    </div>
  );
}

export default InlineFieldTemplate;
