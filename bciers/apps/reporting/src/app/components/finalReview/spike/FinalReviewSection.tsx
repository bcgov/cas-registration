import { Card, CardContent, CardHeader, IconButton } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { PropsWithChildren, useState } from "react";
import { FinalReviewTable } from "./FinalReviewTable";
import { SectionField } from "../templates/SectionReview";

interface FinalReviewCardProps extends PropsWithChildren {
  title: string;
}

export const FinalReviewCard: React.FC<FinalReviewCardProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card sx={{ marginBottom: "2em", whiteSpace: "preserve" }}>
      <CardHeader
        subheader={title}
        sx={{ bgcolor: "#D8D8D8" }}
        subheaderTypographyProps={{
          color: "#013366",
          textTransform: "uppercase",
          fontWeight: "bold",
        }}
        action={
          <IconButton
            aria-label="expand"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        }
      />
      {isExpanded && <CardContent>{children}</CardContent>}
    </Card>
  );
};

export interface FinalReviewSectionProps {
  title: string;
  data: Record<string, any>;
  fields: SectionField[];
  reportingYear?: number;
}

export const FinalReviewSection: React.FC<FinalReviewSectionProps> = ({
  title,
  data,
  fields,
  reportingYear,
}) => {
  return (
    <FinalReviewCard title={title}>
      <FinalReviewTable data={data} fields={fields} />
    </FinalReviewCard>
  );
};
