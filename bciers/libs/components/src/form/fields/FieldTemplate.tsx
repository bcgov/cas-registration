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
  const labelOverride = uiSchema?.["ui:options"]?.labelOverride as string;
  const labelOverrideStyle = uiSchema?.["ui:options"]?.labelOverrideStyle;
  console.log("label", label);
  console.log("style", style);
  console.log("classNames", classNames);
  return (
    <div style={style} className={`w-full ${classNames}`}>
      {isLabel && label && (
        <label
          htmlFor={id}
          className={`inline-block ${labelOverrideStyle}`}
          data-testid="field-template-label"
        >
          {labelOverride ? labelOverride : label}
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
