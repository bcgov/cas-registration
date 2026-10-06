"use client";

import { FieldTemplateProps } from "@rjsf/utils";

// Simple template
// Created to be use with CheckboxWidget though it can be used with any widget depending on the design

function BasicFieldTemplate({
  classNames,
  style,
  children,
}: FieldTemplateProps) {
  // Tailwind utilities are `!important` and would override a marginBottom passed in through ui:options.style
  const marginClasses = style?.marginBottom === undefined ? "mb-4 md:mb-2" : "";
  return (
    <div style={style} className={`w-full ${marginClasses} ${classNames}`}>
      {children}
    </div>
  );
}

export default BasicFieldTemplate;
