import React from "react";
import { Box, Paper } from "@mui/material";

interface ListDiffDisplayProps {
  oldValue: string;
  newValue: string;
}

const parseActivities = (value: string): string[] =>
  value
    ? value
        .split(";")
        .map((a) => a.trim())
        .filter(Boolean)
    : [];

/**
 * Renders a diff view for semicolon-separated list strings.
 * Removed items appear with strikethrough; added ones are labeled "(Added)".
 */
export const ListDiffDisplay: React.FC<ListDiffDisplayProps> = ({
  oldValue,
  newValue,
}) => {
  const oldActivities = parseActivities(oldValue);
  const newActivities = parseActivities(newValue);

  const oldSet = new Set(oldActivities);
  const newSet = new Set(newActivities);

  const removed = oldActivities.filter((a) => !newSet.has(a));
  const added = newActivities.filter((a) => !oldSet.has(a));

  return (
    <Paper
      variant="outlined"
      className="p-2 bg-[#f9f9f9] text-sm/normal [word-break:break-word]"
    >
      <Box className="flex flex-col gap-1">
        {/* Removed items — strikethrough, greyed out */}
        {removed.map((activity) => (
          <span key={activity} className="text-[#666] line-through">
            {activity}
          </span>
        ))}
        {/* Added items — bold with green "(Added)" label */}
        {added.map((activity) => (
          <span key={activity} className="font-bold">
            {activity} <span className="text-[#2e7d32] font-bold">(Added)</span>
          </span>
        ))}
      </Box>
    </Paper>
  );
};
