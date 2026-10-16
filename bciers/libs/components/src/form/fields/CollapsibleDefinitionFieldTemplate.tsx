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
  children,
  label,
  errors,
  readonly,
  classNames,
}: FieldTemplateProps) {
  const [expandCollapse, setExpandCollapse] = useState(true);
  const hasErrors = (errors?.props as any)?.errors;

  return (
    <Paper className={`mb-4 ${classNames}`}>
      <Card className="text-left">
        <Grid container spacing={1} className="justify-between">
          <Grid size="auto">
            <CardHeader
              title={label}
              slotProps={{
                title: {
                  variant: "h6",
                  className: hasErrors ? "text-[#dc2626]" : "text-bc-bg-blue",
                },
              }}
              className="text-[blue]"
            />
          </Grid>
          {!readonly && (
            <Grid size={1}>
              <CardActions className="justify-end">
                <IconButton onClick={() => setExpandCollapse(!expandCollapse)}>
                  {!expandCollapse ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                </IconButton>
              </CardActions>
            </Grid>
          )}
        </Grid>
        <Collapse
          in={expandCollapse}
          sx={{
            marginBottom: "1rem",
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
          {children}
          {errors}
        </Collapse>
      </Card>
    </Paper>
  );
}

export default CollapsibleDefinitionFieldTemplate;
