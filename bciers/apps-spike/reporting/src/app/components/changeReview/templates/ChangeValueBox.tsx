import React from "react";
import { Box, Paper } from "@mui/material";

interface ChangeValueBoxProps {
  oldValue: any;
  newValue: any;
  changeType?: string;
  isDeleted?: boolean; // Add this prop to handle deleted facility reports
}

export const ChangeValueBox: React.FC<ChangeValueBoxProps> = ({
  oldValue,
  newValue,
  changeType,
  isDeleted = false,
}) => {
  const formatValue = (value: any) => {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const isAddedItem = changeType === "added";
  const isDeletedItem = changeType === "deleted";
  const isModifiedItem = changeType === "modified" || !changeType;

  const deletedStyles = isDeleted
    ? {
        textDecoration: "line-through",
        color: "#666",
      }
    : {};

  return (
    <Paper
      variant="outlined"
      sx={{ p: 1, bgcolor: "#f9f9f9", fontSize: 14, wordBreak: "break-all" }}
    >
      {isAddedItem && (
        <Box>
          {typeof newValue === "object" ? (
            <pre style={{ margin: 0, fontWeight: "bold", ...deletedStyles }}>
              {formatValue(newValue)}
            </pre>
          ) : (
            <span style={{ fontWeight: "bold", ...deletedStyles }}>
              {formatValue(newValue)}
            </span>
          )}
        </Box>
      )}
      {isDeletedItem && (
        <Box>
          {typeof oldValue === "object" ? (
            <pre
              style={{
                margin: 0,
                textDecoration: "line-through",
                color: "#666",
              }}
            >
              {formatValue(oldValue)}
            </pre>
          ) : (
            <span
              style={{
                textDecoration: "line-through",
                color: "#666",
              }}
            >
              {formatValue(oldValue)}
            </span>
          )}
        </Box>
      )}
      {isModifiedItem && (
        <Box>
          {typeof oldValue === "object" || typeof newValue === "object" ? (
            <Box>
              <pre
                style={{
                  margin: 0,
                  textDecoration: "line-through",
                  color: "#666",
                  marginBottom: "8px",
                }}
              >
                {formatValue(oldValue)}
              </pre>
              <pre style={{ margin: 0, fontWeight: "bold", ...deletedStyles }}>
                {formatValue(newValue)}
              </pre>
            </Box>
          ) : (
            <Box>
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#666",
                  marginRight: "8px",
                }}
              >
                {formatValue(oldValue)}
              </span>
              <span style={{ fontWeight: "bold", ...deletedStyles }}>
                {formatValue(newValue)}
              </span>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};
