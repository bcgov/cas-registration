"use client";
import { FieldTemplateProps } from "@rjsf/utils";

function TitleOnlyFieldTemplate({
  classNames,
  id,
  style,
  label,
}: FieldTemplateProps) {
  return (
    <div style={style} className={`w-full my-4 ${classNames}`} id={id}>
      {label}
    </div>
  );
}

export default TitleOnlyFieldTemplate;
