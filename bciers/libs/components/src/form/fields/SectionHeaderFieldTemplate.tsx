"use client";

import { FieldTemplateProps } from "@rjsf/utils";

/**
 * Renders a section heading for a flat schema, where a section is a data-less
 * property that exists only to be a heading:
 *
 *   address_information_title: { type: "string", title: "Address Information" }
 *
 * The widget is deliberately not rendered, so the property never reaches the
 * submitted form data.
 */
const SectionHeaderFieldTemplate = ({
  classNames,
  id,
  label,
  uiSchema,
}: FieldTemplateProps) => {
  const marginBottom = uiSchema?.["ui:options"]?.marginBottom || "mb-12";
  const marginTop = uiSchema?.["ui:options"]?.sectionMarginTop || "mt-8";

  return (
    <div
      className={`w-full first:mt-0 ${marginTop} scroll-mt-12 ${classNames}`}
      id={id}
    >
      <h2
        className={`inline-block p-0 text-lg font-bold text-bc-bg-blue m-0 ${marginBottom}`}
      >
        {label}
      </h2>
    </div>
  );
};

export default SectionHeaderFieldTemplate;
