"use client";
import { FieldTemplateProps } from "@rjsf/utils";

function FieldTemplate({
  classNames,
  id,
  style,
  label,
  help,
  required,
  description,
  errors,
  children,
  uiSchema,
}: FieldTemplateProps) {
  // UI Schema options
  const hideLabel = uiSchema?.["ui:options"]?.hideLabel as boolean;

  return (
    <div style={style} className={`w-full ${classNames}`}>
      {!hideLabel && (
        <label htmlFor={id} className="inline-block">
          {label}
          {required ? "*" : null}
        </label>
      )}
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
}

export default FieldTemplate;
