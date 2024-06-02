"use client";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { FieldTemplateProps } from "@rjsf/utils";

interface Props {
  width?: string;
  height?: string;
}

export const AlertIcon = ({ width = "26", height = "26" }: Props) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24.9933 20.6584C25.8033 22.0234 24.7865 23.7298 23.1687 23.7298H2.10886C0.487882 23.7298 -0.524194 22.0208 0.284256 20.6584L10.8143 2.90811C11.6247 1.54241 13.6545 1.54489 14.4635 2.90811L24.9933 20.6584ZM12.6389 16.9885C11.524 16.9885 10.6202 17.8672 10.6202 18.9512C10.6202 20.0351 11.524 20.9138 12.6389 20.9138C13.7538 20.9138 14.6576 20.0351 14.6576 18.9512C14.6576 17.8672 13.7538 16.9885 12.6389 16.9885ZM10.7223 9.93388L11.0478 15.7364C11.0631 16.008 11.294 16.2205 11.5737 16.2205H13.7041C13.9838 16.2205 14.2147 16.008 14.2299 15.7364L14.5555 9.93388C14.5719 9.64059 14.3318 9.39398 14.0297 9.39398H11.2481C10.946 9.39398 10.7058 9.64059 10.7223 9.93388Z"
      fill="#D8292F"
    />
  </svg>
);

function InlineFieldTemplate({
  id,
  label,
  help,
  description,
  rawErrors,
  required,
  children,
  uiSchema,
  classNames,
}: FieldTemplateProps) {
  const isHidden = uiSchema?.["ui:widget"] === "hidden";
  if (isHidden) return null;

  const isErrors = rawErrors && rawErrors.length > 0;
  const error = rawErrors && rawErrors[0];

  // UI Schema options
  const options = uiSchema?.["ui:options"] || {};
  const isLabel = options?.label !== false;

  return (
    <div
      className={`mb-4 md:mb-2 flex flex-col md:flex-row items-start md:items-center ${classNames}`}
    >
      {isLabel && (
        <div className="w-full md:w-3/12">
          <label htmlFor={id} className="font-bold">
            {label}
            {required && "*"}
          </label>
        </div>
      )}
      <div className="relative flex items-center w-full md:w-4/12">
        {children}
      </div>
      {isErrors && (
        <div
          className="w-full md:w-4/12 flex items-center text-red-600 ml-0 md:ml-4"
          role="alert"
        >
          <div className="hidden md:block mr-3">
            <AlertIcon />
          </div>
          <span>{error}</span>
        </div>
      )}
      {description}
      {help}
    </div>
  );
}

export default InlineFieldTemplate;
