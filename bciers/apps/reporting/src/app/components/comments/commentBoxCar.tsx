"use client";

import {
  Button,
  Box,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { Thread } from "./types";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
                Started {thread.created_at} by {thread.created_by}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            //label={`v${thread.version_id}`}
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

        <Collapse in={!areCommentsCollapsed} timeout="auto" unmountOnExit>
          {thread.report_comments_bodyofthesnake.map((comment, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                pl: 3,
                pb:
                  index === thread.report_comments_bodyofthesnake.length - 1
                    ? 0
                    : 2.5,
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
              {index < thread.report_comments_bodyofthesnake.length - 1 && (
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
                    {comment.created_by ?? "Event"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {comment.created_at}
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
          ))}
        </Collapse>
      </Box>

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
