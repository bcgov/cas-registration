import React from "react";
import { Box, Paper } from "@mui/material";

interface ListDiffDisplayProps {
  oldValue: string;
  newValue: string;
}

/**
 * Renders a diff view for semicolon-separated list strings.
 * Removed items appear with strikethrough; added ones are labeled "(Added)".
 */
export const ListDiffDisplay: React.FC<ListDiffDisplayProps> = ({
  oldValue,
  newValue,
}) => {
  const parseActivities = (value: string): string[] =>
    value
      ? value
          .split(";")
          .map((a) => a.trim())
          .filter(Boolean)
      : [];

  const oldActivities = parseActivities(oldValue);
  const newActivities = parseActivities(newValue);

  const oldSet = new Set(oldActivities);
  const newSet = new Set(newActivities);

  const removed = oldActivities.filter((a) => !newSet.has(a));
  const added = newActivities.filter((a) => !oldSet.has(a));

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1, bgcolor: "#f9f9f9", fontSize: 14, wordBreak: "break-word" }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {/* Removed items — strikethrough, greyed out */}
        {removed.map((activity) => (
          <span
            key={activity}
            style={{
              color: "#666",
              textDecoration: "line-through",
            }}
          >
            {activity}
          </span>
        ))}
        {/* Added items — bold with green "(Added)" label */}
        {added.map((activity) => (
          <span key={activity} style={{ fontWeight: "bold" }}>
            {activity}{" "}
            <span style={{ color: "#2e7d32", fontWeight: 700 }}>(Added)</span>
          </span>
        ))}
      </Box>
    </Paper>
  );
};
