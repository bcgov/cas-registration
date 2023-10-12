"use client";
import { FieldTemplateProps } from "@rjsf/utils";

function FieldTemplate(props: FieldTemplateProps) {
  const {
    id,
    classNames,
    style,
    label,
    help,
    required,
    description,
    errors,
    children,
  } = props;
  return (
    <div className={classNames} style={style}>
      <label htmlFor={id}>
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
