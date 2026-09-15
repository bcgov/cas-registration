import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { EventEntry } from "./types";

interface Props {
  event: EventEntry;
  isLast: boolean;
}

const EventSeat: React.FC<Props> = ({ event, isLast }) => {
  const createdAt = new Date(event.created_at);
  const formattedCreatedAt = createdAt.toLocaleString("en-US", {
    timeZone: "America/Vancouver",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Box
      key={
        event.id ??
        `${event.report_version_id}-${event.created_at}-${event.comment}`
      }
      sx={{
        position: "relative",
        pl: 3,
        pb: 2.5,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 9,
          top: 10,
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: "warning.main",
          border: "2px solid",
          borderColor: "background.paper",
          boxShadow: 1,
        }}
      />
      {!isLast && (
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            position: "absolute",
            left: 13,
            top: 20,
            bottom: 0,
            borderColor: "divider",
          }}
        />
      )}

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: "1px dashed",
          borderColor: "warning.main",
          bgcolor: "warning.50",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={0.5}
          sx={{ mb: 0.75 }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            System Event
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formattedCreatedAt}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {event.comment}
        </Typography>
      </Paper>
    </Box>
  );
};

export default EventSeat;
