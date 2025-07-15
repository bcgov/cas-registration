import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardHeader,
  Collapse,
  Grid,
  IconButton,
} from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { renderFieldChange } from "./FieldRenderer";
import {
  renderNestedSourceTypeChanges,
  renderUnitsChanges,
} from "./NestedStructureRenderer";
import {
  generateDisplayLabel,
  compareAndRenderChanges,
} from "@reporting/src/app/components/changeReview/utils/fieldUtils";
import { collapseStyles } from "@reporting/src/app/components/changeReview/constants/styles";

interface SourceTypeCardProps {
  sourceTypeName: string;
  changeData: any;
}

// Reusable collapsible card component
interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
}

const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
}) => {
  const [expand, setExpand] = useState(true);

  return (
    <Card style={{ textAlign: "left", marginBottom: "16px" }}>
      <Grid container spacing={1} sx={{ justifyContent: "space-between" }}>
        <Grid item xs={10}>
          <CardHeader
            sx={{ color: "blue" }}
            titleTypographyProps={{ variant: "h6", color: "#38598A" }}
            title={title}
          />
        </Grid>
        <Grid item xs={2}>
          <CardActions disableSpacing>
            <IconButton
              onClick={() => setExpand(!expand)}
              aria-expanded={expand}
              aria-label="show more"
            >
              {expand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </CardActions>
        </Grid>
      </Grid>
      <Collapse in={expand} sx={collapseStyles}>
        {children}
      </Collapse>
    </Card>
  );
};

// Main SourceTypeCard component
export const SourceTypeCard: React.FC<SourceTypeCardProps> = ({
  sourceTypeName,
  changeData,
}) => {
  // Handle nested changes (units/fuels/emissions)
  if (changeData.newValue && typeof changeData.newValue === "object") {
    return (
      <CollapsibleCard title={sourceTypeName}>
        {renderNestedSourceTypeChanges(changeData.newValue)}
      </CollapsibleCard>
    );
  }

  // Handle modified source types
  if (changeData.changeType === "modified") {
    const oldValue = changeData.oldValue || {};
    const newValue = changeData.newValue || {};
    const changes = compareAndRenderChanges(oldValue, newValue);

    return (
      <CollapsibleCard title={changeData.sourceTypeName}>
        {renderUnitsChanges(oldValue.units || [], newValue.units || [])}
        {changes.map((change) =>
          renderFieldChange(change, change.displayLabel, 0),
        )}
      </CollapsibleCard>
    );
  }

  // Fallback for non-modified changes
  return (
    <CollapsibleCard title={sourceTypeName}>
      {(changeData.fields || []).map((field: any) =>
        renderFieldChange(field, generateDisplayLabel(field.field), 1),
      )}
    </CollapsibleCard>
  );
};
