"use client";
import { FieldTemplateProps } from "@rjsf/utils";

const DefinitionFieldTemplate = ({
  classNames,
  id,
  label,
  children,
  uiSchema,
}: FieldTemplateProps) => {
  const isLabel = uiSchema?.["ui:options"]?.label !== false;
  const customTitle = uiSchema?.["ui:options"]?.title || label;
  const bgColor =
    typeof uiSchema?.["ui:options"]?.bgColor === "string"
      ? uiSchema["ui:options"].bgColor
      : "#f2f2f2"; // Default color if not valid

  const padding = uiSchema?.["ui:options"]?.padding || "p-6";

  return (
    <div
      className={`w-full ${classNames}  ${padding}`}
      id={id}
      style={{ backgroundColor: bgColor }}
    >
      {isLabel && customTitle && (
        <h2 className="text-lg font-bold text-bc-bg-blue mb-4">
          {customTitle}
        </h2>
      )}
      {children}
    </div>
  );
};

export default DefinitionFieldTemplate;
