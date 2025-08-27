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
import {
  renderNestedSourceTypeChanges,
  renderFuelsChanges,
  renderEmissionsChanges,
  renderFieldChange,
} from "./NestedStructureRenderer";
import { generateDisplayLabel } from "@reporting/src/app/components/changeReview/utils/fieldUtils";
import { collapseStyles } from "@reporting/src/app/components/changeReview/constants/styles";

interface SourceTypeCardProps {
  sourceTypeName: string;
  changeData: any;
}

const CollapsibleCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
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

export const SourceTypeCard: React.FC<SourceTypeCardProps> = ({
  sourceTypeName,
  changeData,
}) => {
  // Fuels
  const fuels = changeData.newValue?.fuels || changeData.oldValue?.fuels;
  if (fuels && fuels.length) {
    return (
      <CollapsibleCard title={sourceTypeName}>
        {renderFuelsChanges(
          changeData.oldValue?.fuels || [],
          changeData.newValue?.fuels || [],
        )}
      </CollapsibleCard>
    );
  }

  // Emissions
  const emissions =
    changeData.newValue?.emissions || changeData.oldValue?.emissions;
  if (emissions && emissions.length) {
    return (
      <CollapsibleCard title={sourceTypeName}>
        {renderEmissionsChanges(
          changeData.oldValue?.emissions || [],
          changeData.newValue?.emissions || [],
        )}
      </CollapsibleCard>
    );
  }

  // Nested objects
  if (changeData.newValue && typeof changeData.newValue === "object") {
    return (
      <CollapsibleCard title={sourceTypeName}>
        {renderNestedSourceTypeChanges(changeData.newValue)}
      </CollapsibleCard>
    );
  }

  // Field-level changes
  if (Array.isArray(changeData.fields) && changeData.fields.length) {
    return (
      <CollapsibleCard title={sourceTypeName}>
        {changeData.fields.map((field: any) =>
          renderFieldChange(field, generateDisplayLabel(field.field), 1),
        )}
      </CollapsibleCard>
    );
  }

  return null;
};
