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
    type: "added" | "deleted" | "removed" | "modified";
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

  const changeTypeDisplayLabel: Record<string, string> = {
    deleted: "DELETED",
    removed: "DELETED",
    added: "ADDED",
    modified: "MODIFIED",
  };

  const changeLabel = sourceTypeChange ? (
    <Typography
      component="span"
      className="ml-4 px-4 py-1 rounded-sm text-[0.875rem] font-bold text-white"
      sx={{
        bgcolor:
          sourceTypeChange?.type === "deleted" ||
          sourceTypeChange?.type === "removed"
            ? BC_GOV_SEMANTICS_RED
            : sourceTypeChange?.type === "added"
              ? BC_GOV_SEMANTICS_GREEN
              : "warning.main",
      }}
    >
      (
      {changeTypeDisplayLabel[sourceTypeChange.type] ??
        sourceTypeChange.type.toUpperCase()}
      )
    </Typography>
  ) : null;

  return (
    <Paper className={`mb-2.5 ${classNames}`}>
      <Card className="text-left">
        <Grid container spacing={1} className="justify-between">
          <Grid item xs={10}>
            <CardHeader
              className="text-[blue]"
              titleTypographyProps={{ variant: "h6", color: "#38598A" }}
              title={
                <div className="flex items-center">
                  {label}
                  {changeLabel}
                </div>
              }
            />
          </Grid>
          {!readonly && (
            <Grid item xs={1}>
              <CardActions className="justify-end mr-7.5">
                <IconButton onClick={() => setExpand(!expand)}>
                  {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </CardActions>
            </Grid>
          )}
        </Grid>
        <Collapse in={expand} className="mx-7.5 my-2.5">
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
