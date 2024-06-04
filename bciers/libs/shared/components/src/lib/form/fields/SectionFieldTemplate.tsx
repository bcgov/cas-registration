"use client";

import { FieldTemplateProps } from "@rjsf/utils";

const SectionFieldTemplate = ({
  classNames,
  id,
  label,
  children,
  uiSchema,
}: FieldTemplateProps) => {
  const isLabel = uiSchema?.["ui:options"]?.label !== false;

  return (
    <div
      className={`section-field w-full first:mt-0 mt-8 ${classNames}`}
      id={id}
    >
      {isLabel && label && (
        <label
          htmlFor={id}
          id={id}
          className="inline-block text-lg py-2 font-bold text-bc-bg-blue mb-8"
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
};

export default SectionFieldTemplate;
