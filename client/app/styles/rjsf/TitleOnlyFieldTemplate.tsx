"use client";
import { FieldTemplateProps } from "@rjsf/utils";

function TitleOnlyFieldTemplate({
  classNames,
  id,
  style,
  label,
  uiSchema,
}: FieldTemplateProps) {
  const options = uiSchema?.["ui:options"] || {};
  const jsxTitle = options?.jsxTitle as any;

  return (
    <div style={style} className={`w-full my-8 ${classNames}`} id={id}>
      {jsxTitle || label}
    </div>
  );
}

export default TitleOnlyFieldTemplate;
