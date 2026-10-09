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
  const isDeletedItem = changeType === "removed";
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
      className="p-2 bg-[#f9f9f9] text-sm/normal break-all"
    >
      {isAddedItem && (
        <Box>
          {typeof newValue === "object" ? (
            <pre className="m-0 font-bold" style={deletedStyles}>
              {formatValue(newValue)}
            </pre>
          ) : (
            <span className="font-bold" style={deletedStyles}>
              {formatValue(newValue)}
            </span>
          )}
        </Box>
      )}
      {isDeletedItem && (
        <Box>
          {typeof oldValue === "object" ? (
            <pre className="m-0 line-through text-[#666]">
              {formatValue(oldValue)}
            </pre>
          ) : (
            <span className="line-through text-[#666]">
              {formatValue(oldValue)}
            </span>
          )}
        </Box>
      )}
      {isModifiedItem && (
        <Box>
          {typeof oldValue === "object" || typeof newValue === "object" ? (
            <Box>
              <pre className="m-0 mb-2 line-through text-[#666]">
                {formatValue(oldValue)}
              </pre>
              <pre className="m-0 font-bold" style={deletedStyles}>
                {formatValue(newValue)}
              </pre>
            </Box>
          ) : (
            <Box>
              <span className="line-through text-[#666] mr-2">
                {formatValue(oldValue)}
              </span>
              <span className="font-bold" style={deletedStyles}>
                {formatValue(newValue)}
              </span>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};
