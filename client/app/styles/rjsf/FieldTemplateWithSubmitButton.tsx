"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import SubmitButton from "@/app/components/form/SubmitButton";
import { AlertIcon } from "./InlineFieldTemplate";

function FieldTemplateWithSubmitButton(props: Readonly<FieldTemplateProps>) {
  const {
    id,
    label,
    required,
    children,
    uiSchema,
    style,
    classNames,
    rawErrors,
  } = props;

  const isErrors = rawErrors && rawErrors.length > 0;

  // UI Schema options
  const hideLabel = uiSchema?.["ui:options"]?.hideLabel as boolean;
  const buttonLabel = uiSchema?.["ui:options"]?.buttonLabel as string;

  return (
    <div style={style} className={`grid grid-cols-3 gap-2 my-6 ${classNames}`}>
      <div className="col-span-2 flex gap-2 items-center">
        {!hideLabel && label && (
          <label htmlFor={id} className="font-bold">
            {label}
            {required ? "*" : null}
          </label>
        )}
        {children}
        {isErrors && (
          <div className="text-red-500" role="alert">
            <AlertIcon />
          </div>
        )}
      </div>
      <SubmitButton label={buttonLabel ?? "Submit"} />
    </div>
  );
}

export default FieldTemplateWithSubmitButton;
