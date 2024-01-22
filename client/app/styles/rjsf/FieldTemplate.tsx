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
  const isLabel = uiSchema?.["ui:options"]?.label !== false;

  return (
    <div style={style} className={`w-full ${classNames} `}>
      {isLabel && label && (
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
