import { Card, CardContent, CardHeader, IconButton } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { PropsWithChildren, useState } from "react";

interface Props extends PropsWithChildren {
  title: string;
}

export const FinalReviewCard: React.FC<Props> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card sx={{ marginBottom: "2em" }}>
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
