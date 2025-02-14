"use client";

import { useState } from "react";
import { FieldTemplateProps } from "@rjsf/utils";
import {
  Paper,
  Card,
  Grid,
  CardHeader,
  CardActions,
  IconButton,
  Collapse,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// For definitions with many fields that may be too long e.g. CementProduction, to be used with GridItemFieldTemplate
// Referenced from SourceTypeBoxTemplate, but will include error colors and is 3 columns at full width for UX
function CollapsibleDefinitionFieldTemplate({
  classNames,
  label,
  help,
  description,
  errors,
  children,
  readonly,
}: FieldTemplateProps) {
  const [expand, setExpand] = useState(true);

  return (
    <Paper className={classNames} sx={{ marginBottom: "10px" }}>
      <Card style={{ textAlign: "left" }}>
        <Grid container spacing={1} sx={{ justifyContent: "space-between" }}>
          <Grid item xs={10}>
            <CardHeader
              sx={{ color: "blue" }}
              titleTypographyProps={
                errors?.props.errors
                  ? { variant: "h6", color: "#DC2626" }
                  : { variant: "h6", color: "#38598A" }
              }
              title={label}
            />
          </Grid>
          {!readonly && (
            <Grid item xs={1}>
              <CardActions
                sx={{ justifyContent: "flex-end", marginRight: "30px" }}
              >
                <IconButton onClick={() => setExpand(!expand)}>
                  {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </CardActions>
            </Grid>
          )}
        </Grid>
        <Collapse
          in={expand}
          sx={{
            marginLeft: "30px",
            marginRight: "30px",
            marginTop: "10px",
            marginBottom: "10px",
            fieldset: {
              display: "inline-grid",
              gridTemplateColumns: {
                sm: "1fr 1fr", // If small only have 2 columns
                md: "1fr 1fr 1fr", // If full size, get full 3 columns
              },
              gap: "1rem",
            },
          }}
        >
          {description}
          {children}
          {errors}
          {help}
        </Collapse>
      </Card>
    </Paper>
  );
}

export default CollapsibleDefinitionFieldTemplate;
