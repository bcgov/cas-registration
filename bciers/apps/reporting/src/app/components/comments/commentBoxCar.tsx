"use client";

import {
  Button,
  Box,
  Chip,
  Collapse,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Thread } from "./types";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommentSeat from "./commentSeat";

interface Props {
  thread: Thread;
  onSubmitComment?: (commentText: string, thread: Thread) => void;
}

const CommentBoxCar: React.FC<Props> = ({ thread, onSubmitComment }) => {
  const [commentText, setCommentText] = useState("");
  const [areCommentsCollapsed, setAreCommentsCollapsed] = useState(false);

  const handleSubmitComment = () => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    onSubmitComment?.(trimmedComment, thread);
    setCommentText("");
  };

  const createdAt = new Date(thread.created_at);
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
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 45%)",
      }}
    >
      <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
                {thread.title ?? ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formattedCreatedAt}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={
              thread.report_version
                ? `Report Version ID:${thread.report_version}`
                : ""
            }
            color="primary"
            variant="outlined"
          />
        </Stack>

        {thread.report_section && (
          <Chip
            size="small"
            label={thread.report_section}
            sx={{ mt: 1.5 }}
            variant="filled"
          />
        )}
      </Box>

      <Box sx={{ px: 2.5, py: 1.5 }}>
        {thread.report_comments_bodyofthesnake.length > 0 && (
          <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button
              size="small"
              onClick={() => setAreCommentsCollapsed((prev) => !prev)}
            >
              {areCommentsCollapsed ? (
                <>
                  <ExpandMoreIcon fontSize="small" /> Expand
                </>
              ) : (
                <>
                  <ExpandLessIcon fontSize="small" /> Collapse
                </>
              )}
            </Button>
          </Stack>
        )}

        {/* comment list */}
        <Collapse in={!areCommentsCollapsed} timeout="auto" unmountOnExit>
          {thread.report_comments_bodyofthesnake.map((comment, index) => (
            <CommentSeat
              comment={comment}
              isLast={
                index === thread.report_comments_bodyofthesnake.length - 1
              }
            />
          ))}
        </Collapse>
      </Box>

      {/* reply */}
      <Collapse in={!areCommentsCollapsed} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="flex-start"
          >
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Add a comment"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  event.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              sx={{ minWidth: { xs: "100%", sm: 120 }, mt: { sm: 0.5 } }}
            >
              Submit
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CommentBoxCar;
