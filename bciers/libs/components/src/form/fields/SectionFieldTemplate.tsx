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
  const customMarginBottom = uiSchema?.["ui:options"]?.marginBottom || "mb-12";

  return (
    <div
      // scroll-mt-12 is a top scroll margin for the task list anchor smooth scroll
      className={`section-field w-full first:mt-0 mt-8 scroll-mt-12 ${classNames}`}
      id={id}
    >
      {isLabel && label && (
        <h2
          id={id}
          className={`inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 ${customMarginBottom}`}
        >
          {label}
        </h2>
      )}
      {children}
    </div>
  );
};

export default SectionFieldTemplate;
