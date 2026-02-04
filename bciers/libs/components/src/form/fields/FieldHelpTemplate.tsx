"use client";

import { BC_GOV_BACKGROUND_COLOR_BLUE } from "@bciers/styles/colors";
import { Typography } from "@mui/material";
import { FieldHelpProps } from "@rjsf/utils";

function FieldHelpTemplate(props: FieldHelpProps) {
  const { help } = props;
  return (
    <span>
      <Typography
        variant="body2"
        color={BC_GOV_BACKGROUND_COLOR_BLUE}
        fontStyle="italic"
        fontSize={16}
      >
        {help}
      </Typography>
    </span>
  );
}

export default FieldHelpTemplate;
