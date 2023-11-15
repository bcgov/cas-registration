"use client";

import Grid from "@mui/material/Grid";
import { FieldTemplateProps } from "@rjsf/utils";

function FieldTemplate({
  id,
  label,
  help,
  description,
  errors,
  required,
  children,
  uiSchema,
}: FieldTemplateProps) {
  const isHidden = uiSchema?.["ui:widget"] === "hidden";
  if (isHidden) return null;

  return (
    <Grid
      container
      sx={{
        marginBottom: "8px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {label && (
        <Grid item xs={12} md={3} order={{ xs: 2, md: 1 }}>
          <label htmlFor={id} className="font-bold">
            {label}
            {required ? "*" : null}
          </label>
        </Grid>
      )}
      <Grid item xs={12} md={4} order={{ xs: 1, md: 2 }}>
        {children}
      </Grid>
      {description}
      {errors}
      {help}
    </Grid>
  );
}

export default FieldTemplate;
