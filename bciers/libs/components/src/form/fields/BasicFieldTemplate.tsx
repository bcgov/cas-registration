"use client";

import { FieldTemplateProps } from "@rjsf/utils";

// Simple template
// Created to be use with CheckboxWidget though it can be used with any widget depending on the design

function BasicFieldTemplate({
  classNames,
  style,
  children,
}: FieldTemplateProps) {
  return (
    <div style={style} className={`w-full mb-4 md:mb-2 ${classNames}`}>
      {children}
    </div>
  );
}

export default BasicFieldTemplate;
