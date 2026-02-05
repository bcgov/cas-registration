"use client";
import { FieldTemplateProps } from "@rjsf/utils";

/**
 * A field template that wraps fields in a grey background box with a clickable link in the title.
 */
const GreyBoxWithLinkFieldTemplate = ({
  classNames,
  label,
  description,
  errors,
  children,
  uiSchema,
  formContext,
  registry,
}: FieldTemplateProps) => {
  const bgColor = (uiSchema?.["ui:options"]?.bgColor as string) || "#f2f2f2";
  const padding = uiSchema?.["ui:options"]?.padding || "p-2";
  const showLabel = uiSchema?.["ui:options"]?.label !== false;
  const linkUrl = uiSchema?.["ui:options"]?.linkUrl as string;
  const linkText = uiSchema?.["ui:options"]?.linkText as string;
  const condition = uiSchema?.["ui:options"]?.condition as
    | ((formData: any) => boolean)
    | undefined;

  // If condition is provided, check if we should render
  if (condition) {
    const formData = registry?.formContext?.formData || formContext?.formData;
    if (!condition(formData)) {
      return null; // Don't render if condition is false
    }
  }

  return (
    <>
      <div
        style={{
          display: "block",
          marginTop: "1rem",
          marginBottom: "1rem",
        }}
      />
      <div
        className={`min-w-full rounded-md ${padding} ${classNames}`}
        style={{
          backgroundColor: bgColor,
          paddingLeft: "1rem",
        }}
      >
        {showLabel && label && (
          <div className="font-semibold mb-2">
            {label}
            {linkUrl && linkText && (
              <>
                {" "}
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {linkText}
                </a>
              </>
            )}
            .
          </div>
        )}
        {description}
        {children}
        {errors}
      </div>
    </>
  );
};

export default GreyBoxWithLinkFieldTemplate;
