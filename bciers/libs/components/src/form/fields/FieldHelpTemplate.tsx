"use client";

import { FieldHelpProps } from "@rjsf/utils";

function FieldHelpTemplate(props: FieldHelpProps) {
  const { help } = props;
  return (
    help && (
      <small>
        <b>Note: </b>
        {help}
      </small>
    )
  );
}

export default FieldHelpTemplate;
