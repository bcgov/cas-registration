"use client";

import { FieldTemplateProps } from "@rjsf/utils";
import InlineFieldTemplate from "./InlineFieldTemplate";
import { JSXElementConstructor, ReactElement } from "react";

function MethodologyFieldTemplate(props: FieldTemplateProps) {
  const { formData } = props;

  const notedMethodologies = [
    "Alternative Parameter Measurement Methodology",
    "Replacement Methodology",
  ];

  let note: ReactElement<any, string | JSXElementConstructor<any>> | undefined =
    undefined;
  if (formData && notedMethodologies.includes(formData)) {
    note = (
      <small>
        * By selecting {formData}, you may be contacted by Ministry staff to
        verify compliance
      </small>
    );
  }

  return <InlineFieldTemplate {...props} description={note} />;
}

export default MethodologyFieldTemplate;
