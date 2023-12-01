"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import SubmitButton from "@/app/components/form/SubmitButton";

function FieldTemplateWithSubmitButton(props: Readonly<FieldTemplateProps>) {
  const { id, label, required, children, uiSchema, style, errors, classNames } =
    props;

  // UI Schema options
  const hideLabel = uiSchema?.["ui:options"]?.hideLabel as boolean;
  const buttonLabel = uiSchema?.["ui:options"]?.buttonLabel as string;

  return (
    <div style={style} className={`grid grid-cols-3 gap-2 ${classNames}`}>
      <div className="col-span-2">
        {!hideLabel && label && (
          <label htmlFor={id} className="font-bold">
            {label}
            {required ? "*" : null}
          </label>
        )}
        {children}
      </div>
      {errors}
      <SubmitButton label={buttonLabel ?? "Submit"} />
    </div>
  );
}

export default FieldTemplateWithSubmitButton;
