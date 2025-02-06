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

// For definitions with many fields e.g. CementProduction
// Referenced from SourceTypeBoxTemplate, but will include error colors and is 3x3 at full width for UX
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
              titleTypographyProps={{ variant: "h6", color: "#38598A" }}
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
