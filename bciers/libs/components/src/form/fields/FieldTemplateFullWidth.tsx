"use client";
import { FieldTemplateProps } from "@rjsf/utils";

const FieldTemplateFullWidth = ({
  id,
  classNames,
  children,
  style,
}: FieldTemplateProps) => {
  return (
    <div
      id={id}
      style={style}
      className={`w-full lg:w-full my-4 ${classNames}`}
    >
      {children}
    </div>
  );
};

export default FieldTemplateFullWidth;
