import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import React from "react";
import { Comment } from "./types";

interface Props {
  comment: Comment;
  isLast: boolean;
}

const CommentSeat: React.FC<Props> = ({ comment, isLast }) => {
  const createdAt = new Date(comment.created_at);
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
      key={comment.id}
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
          bgcolor: "primary.light",
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
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={0.5}
          sx={{ mb: 0.75 }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {comment.user_name}
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
          {comment.comment}
        </Typography>
      </Paper>
    </Box>
  );
};

export default CommentSeat;
