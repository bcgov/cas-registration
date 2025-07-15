"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import {
  Grid,
  Card,
  CardActions,
  CardHeader,
  Collapse,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { BC_GOV_SEMANTICS_GREEN, BC_GOV_SEMANTICS_RED } from "@bciers/styles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useState } from "react";

interface SourceTypeBoxTemplateProps extends Partial<FieldTemplateProps> {
  isDeleted?: boolean;
  sourceTypeChange?: {
    type: "added" | "deleted" | "modified";
    oldValue?: any;
    newValue?: any;
  };
}

export function SourceTypeBoxTemplate({
  classNames,
  label,
  help,
  description,
  errors,
  children,
  readonly,
  isDeleted = false,
  sourceTypeChange,
}: SourceTypeBoxTemplateProps) {
  const [expand, setExpand] = useState(true);

  const contentStyles = isDeleted
    ? {
        textDecoration: "line-through",
        color: "#666",
      }
    : {};

  const changeLabel = sourceTypeChange ? (
    <Typography
      component="span"
      sx={{
        ml: 2,
        px: 2,
        py: 0.5,
        borderRadius: 1,
        fontSize: "0.875rem",
        fontWeight: "bold",
        color: "white",
        bgcolor:
          sourceTypeChange?.type === "deleted"
            ? BC_GOV_SEMANTICS_RED
            : sourceTypeChange?.type === "added"
              ? BC_GOV_SEMANTICS_GREEN
              : "warning.main",
      }}
    >
      ({sourceTypeChange.type.toUpperCase()})
    </Typography>
  ) : null;

  return (
    <Paper className={classNames} sx={{ marginBottom: "10px" }}>
      <Card style={{ textAlign: "left" }}>
        <Grid container spacing={1} sx={{ justifyContent: "space-between" }}>
          <Grid item xs={10}>
            <CardHeader
              sx={{ color: "blue" }}
              titleTypographyProps={{ variant: "h6", color: "#38598A" }}
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  {label}
                  {changeLabel}
                </div>
              }
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
          <div style={contentStyles}>
            {description}
            {children}
          </div>
          {errors}
          {help}
        </Collapse>
      </Card>
    </Paper>
  );
}

export default SourceTypeBoxTemplate;
