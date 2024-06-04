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
      // scroll-mt-12 is a top scroll margin for the task list anchor smooth scroll
      className={`section-field w-full first:mt-0 mt-8 scroll-mt-12 ${classNames}`}
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
