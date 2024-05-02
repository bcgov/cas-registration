"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import SubmitButton from "@/app/components/form/SubmitButton";
import { AlertIcon } from "./InlineFieldTemplate";

function FieldTemplateWithSubmitButton(props: Readonly<FieldTemplateProps>) {
  const {
    id,
    label,
    required,
    children,
    uiSchema,
    style,
    classNames,
    rawErrors,
  } = props;

  const isErrors = rawErrors && rawErrors.length > 0;
  const error = rawErrors && rawErrors[0];
  // UI Schema options
  const isLabel = uiSchema?.["ui:options"]?.label !== false;
  const buttonLabel = uiSchema?.["ui:options"]?.buttonLabel as string;

  return (
    <>
      <div
        style={style}
        className={`grid grid-cols-3 gap-2 mt-6 relative ${classNames}`}
      >
        {isErrors && (
          <div
            className="hidden md:flex items-center text-red-500 text-sm w-fit absolute top-[14px] left-[-148px]"
            role="alert"
          >
            <span>{error}</span>
            <span className="ml-3">
              <AlertIcon width={"26"} height={"26"} />
            </span>
          </div>
        )}

        <div className="col-span-2 flex gap-2 items-center">
          {isLabel && label && (
            <label htmlFor={id} className="font-bold">
              {label}
              {required ? "*" : null}
            </label>
          )}
          {children}
        </div>
        <SubmitButton label={buttonLabel ?? "Submit"} />
      </div>
      {isErrors && (
        <div
          className="flex md:hidden items-center text-red-500 text-sm w-fit"
          role="alert"
        >
          <span>{error}</span>
        </div>
      )}
    </>
  );
}

export default FieldTemplateWithSubmitButton;
