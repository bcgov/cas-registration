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
}: FieldTemplateProps) {
  return (
    <div style={style} className={`w-full ${classNames}`}>
      <label htmlFor={id} className="inline-block">
        {label}
        {required ? "*" : null}
      </label>
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
}

export default FieldTemplate;
